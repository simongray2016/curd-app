var faker = require("faker");

var database = { products: [] };

for (var i = 1; i <= 100; i++) {
  database.products.push({
    id: i,
    name: faker.commerce.productName(),
    status: faker.helpers.randomize(["Active", "Suspended", "Expriring"]),
    category: faker.helpers.randomize(["Men", "Ladies", "Unisex"]),
    createAt: faker.date.past(),
    material: faker.commerce.productMaterial(),
    imgUrl: faker.random.image(),
    description: faker.commerce.productDescription(),
    stock: faker.datatype.number(100),
    price: faker.datatype.number(100000),
  });
}

console.log(JSON.stringify(database));
