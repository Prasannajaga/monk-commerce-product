export async function fetchProducts(search: string = "", page = 0, limit = 10) {
    const response = await fetch(`https://stageapi.monkcommerce.app/task/products/search?search=${search}&page=${page}&limit=${limit}`, {
        headers: {
            "x-api-key": "72njgfa948d9aS7gs5"
        }
    });
    const data = await response.json(); 
    return data;
}