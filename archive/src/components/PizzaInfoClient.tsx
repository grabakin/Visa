import { createResource, createSignal, For } from "solid-js";

interface Topping {
  id: number;
  name: string;
  calories: number;
}

interface Sauce {
  id: number;
  name: string;
  isVegan: boolean;
}

interface Pizza {
  id: number;
  name: string;
  description?: string;
  sauce: Sauce | null; // Sauce can be null
  toppings: Topping[];
}

const fetchPizzas = async (): Promise<Pizza[]> => {
  const response = await fetch("http://localhost:5200/Pizza");
  if (!response.ok) {
    throw new Error("Failed to fetch pizzas");
  }
  return response.json();
};

const PizzaManager = () => {
  const [pizzas, { refetch }] = createResource<Pizza[]>(fetchPizzas);

  // States for create pizza form
  const [newName, setNewName] = createSignal("");
  const [newDescription, setNewDescription] = createSignal("");
  const [newSauceId, setNewSauceId] = createSignal("");

  // States for dynamic inputs per pizza for adding topping and updating sauce
  const [toppingIdInputs, setToppingIdInputs] = createSignal<
    Record<number, string>
  >({});
  const [sauceIdInputs, setSauceIdInputs] = createSignal<
    Record<number, string>
  >({});

  const createPizza = async () => {
    const payload = {
      name: newName(),
      description: newDescription(),
      sauceId: Number(newSauceId()),
    };
    const response = await fetch("http://localhost:5200/Pizza", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      alert("Failed to create pizza");
      return;
    }
    refetch();
    setNewName("");
    setNewDescription("");
    setNewSauceId("");
  };

  const addTopping = async (pizzaId: number) => {
    const toppingId = toppingIdInputs()[pizzaId];
    if (!toppingId) return;
    const response = await fetch(
      `http://localhost:5200/Pizza/${pizzaId}/AddTopping?toppingId=${toppingId}`,
      { method: "POST" }
    );
    if (!response.ok) {
      alert("Failed to add topping");
      return;
    }
    refetch();
    setToppingIdInputs((prev) => ({ ...prev, [pizzaId]: "" }));
  };

  const updateSauce = async (pizzaId: number) => {
    const sauceId = sauceIdInputs()[pizzaId];
    if (!sauceId) return;
    const response = await fetch(
      `http://localhost:5200/Pizza/${pizzaId}/UpdateSauce?sauceId=${sauceId}`,
      { method: "PUT" }
    );
    if (!response.ok) {
      alert("Failed to update sauce");
      return;
    }
    refetch();
    setSauceIdInputs((prev) => ({ ...prev, [pizzaId]: "" }));
  };

  const deletePizza = async (pizzaId: number) => {
    const response = await fetch(`http://localhost:5200/Pizza/${pizzaId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      alert("Failed to delete pizza");
      return;
    }
    refetch();
  };

  return (
    <div class="container mx-auto p-4">
      <h1 class="text-4xl font-bold text-center mb-8">Pizza Manager</h1>

      {/* Create Pizza Form */}
      <div class="bg-white shadow-md rounded p-6 mb-8 max-w-lg mx-auto">
        <h2 class="text-2xl font-semibold mb-4">Create New Pizza</h2>
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={newName()}
            onInput={(e) => setNewName(e.currentTarget.value)}
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={newDescription()}
            onInput={(e) => setNewDescription(e.currentTarget.value)}
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Sauce ID</label>
          <input
            type="text"
            value={newSauceId()}
            onInput={(e) => setNewSauceId(e.currentTarget.value)}
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={createPizza}
          class="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Create Pizza
        </button>
      </div>

      {/* List of Pizzas */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <For each={pizzas()}>
          {(pizza: Pizza) => (
            <div class="bg-white shadow-lg rounded-lg p-4">
              <div class="flex justify-between items-center mb-2">
                <h2 class="text-2xl font-semibold">{pizza.name}</h2>
                <button
                  onClick={() => deletePizza(pizza.id)}
                  class="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
              {pizza.description && (
                <p class="text-gray-600 mb-2">{pizza.description}</p>
              )}
              <div class="mb-2">
                <h3 class="font-medium text-gray-700">Sauce:</h3>
                <p class="text-gray-600">
                  {pizza.sauce ? (
                    <>
                      {pizza.sauce.name} (ID: {pizza.sauce.id})
                    </>
                  ) : (
                    "No Sauce"
                  )}
                </p>
                <div class="mt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="New Sauce ID"
                    value={sauceIdInputs()[pizza.id] || ""}
                    onInput={(e) =>
                      setSauceIdInputs((prev) => ({
                        ...prev,
                        [pizza.id]: e.currentTarget.value,
                      }))
                    }
                    class="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => updateSauce(pizza.id)}
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Update Sauce
                  </button>
                </div>
              </div>
              <div class="mb-2">
                <h3 class="font-medium text-gray-700">Toppings:</h3>
                <ul class="list-disc list-inside text-gray-600 mb-2">
                  <For each={pizza.toppings}>
                    {(topping) => (
                      <li>
                        {topping.name} ({topping.calories} cal)
                      </li>
                    )}
                  </For>
                </ul>
                <div class="mt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Topping ID"
                    value={toppingIdInputs()[pizza.id] || ""}
                    onInput={(e) =>
                      setToppingIdInputs((prev) => ({
                        ...prev,
                        [pizza.id]: e.currentTarget.value,
                      }))
                    }
                    class="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => addTopping(pizza.id)}
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Add Topping
                  </button>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default PizzaManager;
