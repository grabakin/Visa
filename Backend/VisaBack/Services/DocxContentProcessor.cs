using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing; // Paragraph, Run, Text etc.
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text; // Required for StringBuilder
using System.Threading.Tasks; // For async method signature, though OpenXML is mostly sync

namespace VisaBack.Services // Make sure this namespace matches your project
{
    /// <summary>
    /// Handles DOCX file processing for placeholder replacement using OpenXML SDK.
    /// </summary>
    public class DocxContentProcessor
    {
        private readonly ILogger _logger;

        public DocxContentProcessor(ILogger logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Processes the DOCX file to replace placeholders.
        /// Note: OpenXML SDK operations are predominantly synchronous.
        /// This async wrapper is for API consistency if needed, actual work is sync.
        /// </summary>
        public Task ProcessFileAsync(string filePath, Dictionary<string, string> placeholderValues)
        {
            try
            {
                _logger.LogInformation("Opening DOCX file: {FilePath} for robust processing.", filePath);
                // Open the Wordprocessing document in read/write mode.
                using (WordprocessingDocument wordDoc = WordprocessingDocument.Open(filePath, true))
                {
                    // Process Main Document Part
                    if (wordDoc.MainDocumentPart != null)
                    {
                        _logger.LogDebug("Processing MainDocumentPart.");
                        ProcessOpenXmlPart(wordDoc.MainDocumentPart, placeholderValues);
                        // Saving the part's root element ensures changes are written.
                        wordDoc.MainDocumentPart.Document.Save();
                    }

                    // Process Header Parts
                    if (wordDoc.MainDocumentPart?.HeaderParts != null)
                    {
                        foreach (var headerPart in wordDoc.MainDocumentPart.HeaderParts)
                        {
                            _logger.LogDebug("Processing HeaderPart: {Uri}", headerPart.Uri);
                            ProcessOpenXmlPart(headerPart, placeholderValues);
                            headerPart.Header.Save();
                        }
                    }

                    // Process Footer Parts
                    if (wordDoc.MainDocumentPart?.FooterParts != null)
                    {
                        foreach (var footerPart in wordDoc.MainDocumentPart.FooterParts)
                        {
                            _logger.LogDebug("Processing FooterPart: {Uri}", footerPart.Uri);
                            ProcessOpenXmlPart(footerPart, placeholderValues);
                            footerPart.Footer.Save();
                        }
                    }

                    // Optional: Process Footnotes and Endnotes Parts if they exist
                    if (wordDoc.MainDocumentPart?.FootnotesPart != null)
                    {
                        _logger.LogDebug("Processing FootnotesPart.");
                        ProcessOpenXmlPart(wordDoc.MainDocumentPart.FootnotesPart, placeholderValues);
                        wordDoc.MainDocumentPart.FootnotesPart.Footnotes.Save();
                    }

                    if (wordDoc.MainDocumentPart?.EndnotesPart != null)
                    {
                        _logger.LogDebug("Processing EndnotesPart.");
                        ProcessOpenXmlPart(wordDoc.MainDocumentPart.EndnotesPart, placeholderValues);
                        wordDoc.MainDocumentPart.EndnotesPart.Endnotes.Save();
                    }
                    // Note: Text can also exist in other places like Text Boxes, SmartArt, Charts, etc.
                    // Handling those requires diving deeper into DrawingML and other schemas,
                    // which is significantly more complex. This version focuses on common text containers.
                }
                _logger.LogInformation("Successfully processed and saved robustly DOCX file: {FilePath}", filePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing DOCX file robustly: {FilePath}", filePath);
                throw; // Rethrow to allow caller (DocxFiller) to handle
            }
            return Task.CompletedTask; // Return a completed task to satisfy the async signature
        }

        /// <summary>
        /// Processes a given OpenXmlPart (like MainDocumentPart, HeaderPart, etc.)
        /// to replace placeholders in its content.
        /// </summary>
        private void ProcessOpenXmlPart(OpenXmlPart part, Dictionary<string, string> placeholderValues)
        {
            if (part?.RootElement == null)
            {
                _logger.LogWarning("Part or its RootElement is null. URI: {Uri}", part?.Uri);
                return;
            }

            // First pass: Handle placeholders entirely within a single Text element.
            // This is common and faster to process.
            List<Text> allTextElementsInPart = part.RootElement.Descendants<Text>().ToList();
            foreach (var placeholder in placeholderValues)
            {
                string findText = $"![{placeholder.Key}]";
                string replaceWithText = placeholder.Value ?? string.Empty;

                foreach (Text textElement in allTextElementsInPart)
                {
                    if (textElement.Text.Contains(findText))
                    {
                        // Preserve existing space handling if necessary
                        var originalSpaceAttribute = textElement.Space;
                        textElement.Text = textElement.Text.Replace(findText, replaceWithText);
                        if (originalSpaceAttribute != null && originalSpaceAttribute.Value == SpaceProcessingModeValues.Preserve)
                        {
                            textElement.Space = new DocumentFormat.OpenXml.EnumValue<SpaceProcessingModeValues>(SpaceProcessingModeValues.Preserve);
                        }
                        _logger.LogTrace("Replaced simple placeholder '{FindText}' in single Text element in part {Uri}.", findText, part.Uri);
                    }
                }
            }

            // Second, more complex pass: Handle placeholders that might be split across multiple Runs or Text elements within paragraphs.
            // This iterates through paragraphs and tries to reconstruct and replace split placeholders.
            foreach (Paragraph paragraph in part.RootElement.Descendants<Paragraph>())
            {
                foreach (var placeholder in placeholderValues)
                {
                    string findText = $"![{placeholder.Key}]";
                    string replaceWithText = placeholder.Value ?? string.Empty;
                    ReplaceTextSpanningRunsInParagraph(paragraph, findText, replaceWithText, part.Uri.ToString());
                }
            }
        }

        /// <summary>
        /// Replaces occurrences of a searchText string with replaceText within a given paragraph.
        /// This method handles cases where the searchText might be split across multiple Runs
        /// and, consequently, multiple Text elements.
        /// </summary>
        private void ReplaceTextSpanningRunsInParagraph(Paragraph paragraph, string searchText, string replaceText, string partUriForLogging)
        {
            if (string.IsNullOrEmpty(searchText)) return;

            List<Run> runs = paragraph.Elements<Run>().ToList();
            if (!runs.Any()) return;

            // We need to iterate potentially multiple times if replacements affect subsequent matches.
            // A 'while changed' loop is robust but can be complex. This simplified loop will make one pass.
            // For more complex scenarios (e.g., replacement text itself forms a new placeholder), multiple passes might be needed.

            for (int i = 0; i < runs.Count; i++)
            {
                StringBuilder currentTextSpan = new StringBuilder();
                List<Run> involvedRuns = new List<Run>();

                // Try to accumulate text from runs to match searchText
                for (int j = i; j < runs.Count; j++)
                {
                    Run currentRun = runs[j];
                    // Concatenate all Text elements within the current run
                    foreach (Text textNode in currentRun.Elements<Text>())
                    {
                        currentTextSpan.Append(textNode.Text);
                    }
                    involvedRuns.Add(currentRun);

                    string accumulatedString = currentTextSpan.ToString();

                    // Check if the accumulated string contains the searchText
                    int matchIndex = accumulatedString.IndexOf(searchText);
                    if (matchIndex != -1)
                    {
                        // Found the searchText spanning 'involvedRuns'
                        _logger.LogTrace("Found potential spanning placeholder '{SearchText}' in paragraph in part {Uri}.", searchText, partUriForLogging);

                        string prefixInSpan = accumulatedString.Substring(0, matchIndex);
                        string suffixInSpan = accumulatedString.Substring(matchIndex + searchText.Length);

                        // The first run in the sequence will hold the prefix (if any) and the replacement text.
                        Run firstInvolvedRun = involvedRuns.First();
                        firstInvolvedRun.RemoveAllChildren<Text>(); // Clear its existing text nodes

                        if (!string.IsNullOrEmpty(prefixInSpan))
                        {
                            firstInvolvedRun.AppendChild(new Text(prefixInSpan) { Space = SpaceProcessingModeValues.Preserve });
                        }
                        firstInvolvedRun.AppendChild(new Text(replaceText) { Space = SpaceProcessingModeValues.Preserve });

                        // The last run in the sequence will hold the suffix (if any).
                        // If the first and last involved run are the same, append suffix there.
                        Run lastInvolvedRun = involvedRuns.Last();
                        if (firstInvolvedRun == lastInvolvedRun)
                        {
                            if (!string.IsNullOrEmpty(suffixInSpan))
                            {
                                firstInvolvedRun.AppendChild(new Text(suffixInSpan) { Space = SpaceProcessingModeValues.Preserve });
                            }
                        }
                        else
                        {
                            // If suffix exists and belongs to a different run, clear that run and add new text.
                            lastInvolvedRun.RemoveAllChildren<Text>();
                            if (!string.IsNullOrEmpty(suffixInSpan))
                            {
                                lastInvolvedRun.AppendChild(new Text(suffixInSpan) { Space = SpaceProcessingModeValues.Preserve });
                            }
                        }

                        // Remove Text from intermediate runs (or remove the runs if they become empty and had no other significant properties).
                        // For simplicity, we just clear their text content.
                        for (int k = 1; k < involvedRuns.Count - 1; k++) // Exclude first and last
                        {
                            involvedRuns[k].RemoveAllChildren<Text>();
                            // Optionally, remove the run if it's now empty: if (!involvedRuns[k].HasChildren) involvedRuns[k].Remove();
                        }

                        // If firstInvolvedRun != lastInvolvedRun, and lastInvolvedRun is now empty of text but had other children (e.g. formatting),
                        // it might be desirable to remove it if it had no suffix. Or, if it only contained part of the placeholder.
                        // This part can get very complex depending on desired cleanup.
                        // If lastInvolvedRun had no suffix and it wasn't the first run, clear its text (done above).
                        // If it is now empty and not the first run, consider removing it.

                        if (firstInvolvedRun != lastInvolvedRun && !lastInvolvedRun.Elements<Text>().Any(t => !string.IsNullOrEmpty(t.Text)))
                        {
                            // If the last run is now effectively empty of our text and is not the primary run,
                            // and if it has no other significant children (like Drawing), it could be removed.
                            // This heuristic is tricky. For now, clearing text is safer.
                            // if (!lastInvolvedRun.HasChildren || !lastInvolvedRun.Descendants().Any(d => !(d is Text) && !(d is RunProperties)))
                            // {
                            //    lastInvolvedRun.Remove();
                            // }
                        }


                        _logger.LogInformation("Replaced spanning placeholder '{SearchText}' with '{ReplaceText}' in paragraph in part {Uri}.", searchText, replaceText, partUriForLogging);

                        // Important: The structure of the paragraph (runs) has changed.
                        // To handle overlapping matches or matches created by previous replacements correctly,
                        // we should re-evaluate the paragraph or adjust indices.
                        // For this version, we'll restart the scan for the current paragraph for simplicity.
                        runs = paragraph.Elements<Run>().ToList(); // Re-fetch runs
                        i = -1; // Restart scan for this paragraph from the beginning.
                        break; // Break from the inner loop (j) and restart the outer loop (i)
                    }

                    // Optimization: If accumulatedString is longer than searchText and doesn't start with it
                    // (or a significant portion of it), we might break early from the j-loop.
                    // This heuristic needs to be careful not to break prematurely if searchText is very long.
                    if (accumulatedString.Length > searchText.Length && !searchText.StartsWith(accumulatedString.Substring(0, Math.Min(accumulatedString.Length, searchText.Length / 2 + 1))))
                    {
                        // If the beginning of accumulatedString doesn't look like the beginning of searchText, stop extending this span.
                        break;
                    }
                }
                if (i == -1) break; // If we restarted, break from this iteration of placeholder search for this paragraph.
            }
        }
    }
}