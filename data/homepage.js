const data = {
    name: "My E-commerce Platform",
    routes: [
        {
            url: "/products/all",
            description: "Gets all products",
            method: "GET",
        },
        {
            url: "/products/create",
            description: "Creates new products",
            method: "POST",
        },
        {
            url: "/transaction/all",
            description: "Get all transactions",
            method: "GET",
        },
        {
            url: "/transaction/checkout",
            description: "Customer checks out from system",
            method: "POST",
        },
    ],
};

module.exports = data;
