// const commonColors = [
//     { name: "Red", value: "#FF0000" },
//     { name: "Green", value: "#008000" },
//     { name: "Blue", value: "#0000FF" },
//     { name: "Yellow", value: "#FFFF00" },
//     { name: "Orange", value: "#FFA500" },
//     { name: "Purple", value: "#800080" },
//     { name: "Pink", value: "#FFC0CB" },
//     { name: "Brown", value: "#8B4513" },
//     { name: "Grey", value: "#808080" },
//     { name: "Black", value: "#000000" },
//     { name: "White", value: "#FFFFFF" },
//     { name: "Cyan", value: "#00FFFF" },
//     { name: "Magenta", value: "#FF00FF" },
//     { name: "Lime", value: "#00FF00" },
//     { name: "Teal", value: "#008080" },
//     { name: "Indigo", value: "#4B0082" },
//     { name: "Maroon", value: "#800000" },
//     { name: "Olive", value: "#808000" },
//     { name: "Navy", value: "#000080" },
//     { name: "Silver", value: "#C0C0C0" },
//     { name: "Gold", value: "#FFD700" },
//     { name: "Beige", value: "#F5F5DC" },
//     { name: "Turquoise", value: "#40E0D0" },
//     { name: "Aquamarine", value: "#7FFFD4" },
//     { name: "Lavender", value: "#E6E6FA" },
//     { name: "Slate Gray", value: "#708090" },
//     { name: "Tomato", value: "#FF6347" },
//     { name: "Chocolate", value: "#D2691E" },
//     { name: "Steel Blue", value: "#4682B4" },
//     { name: "Rosy Brown", value: "#BC8F8F" },
//     { name: "Forest Green", value: "#228B22" },
//     { name: "Deep Pink", value: "#FF1493" },
//     { name: "Aqua", value: "#00FFFF" },
//     { name: "Salmon", value: "#FA8072" },
//     { name: "Goldenrod", value: "#DAA520" },
//     { name: "Cornflower Blue", value: "#6495ED" },
//     { name: "Firebrick", value: "#B22222" },
//     { name: "Dark Slate Gray", value: "#2F4F4F" },
//     { name: "Medium Violet Red", value: "#C71585" },
//     // Add more colors as needed
// ];
// await db.color.createMany({
//     data: commonColors,
// });
// await db.category.create({
//     data: {
//         name: "Clothing",
//         subcategories: {
//             create: [
//                 {
//                     name: "Men's Clothing"
//                 },
//                 {
//                     name: "Women's Clothing"
//                 },
//                 {
//                     name: "Kids' Clothing"
//                 },
//                 {
//                     name: "Active Wear"
//                 },
//                 {
//                     name: "Outer Wear"
//                 }
//             ]
//         }
//     }
// });
// await db.category.create({
//     data: {
//         name: "Shoes",
//         subcategories: {
//             create: [
//                 {
//                     name: "Men's Shoes"
//                 },
//                 {
//                     name: "Women's Shoes"
//                 },
//                 {
//                     name: "Kids' Shoes"
//                 },
//                 {
//                     name: "Athletic Shoes"
//                 },
//                 {
//                     name: "Boots"
//                 }
//             ]
//         }
//     }
// });
// await db.category.create({
//     data: {
//       name: "Accessories",
//       subcategories: {
//         create: [
//           { name: "Jewelry" },
//           { name: "Watches" },
//           { name: "Sunglasses" },
//           { name: "Hats and Caps" },
//           { name: "Scarves and Wraps" },
//           { name: "Bags and Purses" },
//         ],
//       },
//     },
// });
// await db.category.create({
//     data: {
//       name: "Electronics",
//       subcategories: {
//         create: [
//           { name: "Smartphones" },
//           { name: "Laptops and Computers" },
//           { name: "Tablets" },
//           { name: "Cameras" },
//           { name: "Audio Devices" },
//           { name: "Wearable Technology" },
//         ],
//       },
//     },
// });
// await db.category.create({
//     data: {
//       name: "Home and Living",
//       subcategories: {
//         create: [
//           { name: "Furniture" },
//           { name: "Bedding and Linens" },
//           { name: "Home Decor" },
//           { name: "Kitchen and Dining" },
//           { name: "Appliances" },
//           { name: "Lighting" },
//         ],
//       },
//     },
// });
// await db.category.create({
//     data: {
//       name: "Beauty and Personal Care",
//       subcategories: {
//         create: [
//           { name: "Skincare" },
//           { name: "Haircare" },
//           { name: "Makeup" },
//           { name: "Fragrances" },
//           { name: "Personal Care Products" },
//         ],
//       },
//     },
// });
// await db.category.create({
//     data: {
//       name: "Sports and Outdoors",
//       subcategories: {
//         create: [
//           { name: "Exercise Equipment" },
//           { name: "Sports Apparel" },
//           { name: "Outdoor Gear" },
//           { name: "Camping and Hiking" },
//           { name: "Cycling" },
//         ],
//       },
//     },
// });
// await db.category.create({
//     data: {
//       name: "Health and Wellness",
//       subcategories: {
//         create: [
//           { name: "Vitamins and Supplements" },
//           { name: "Fitness Accessories" },
//           { name: "Wellness Products" },
//           { name: "Personal Care" },
//           { name: "Health Monitors" },
//         ],
//       },
//     },
// });
// await db.category.create({
//     data: {
//       name: "Books and Stationery",
//       subcategories: {
//         create: [
//           { name: "Books" },
//           { name: "Notebooks and Journals" },
//           { name: "Writing Instruments" },
//           { name: "Art Supplies" },
//           { name: "Calendars and Planners" },
//         ],
//       },
//     },
// });
//  await db.category.create({
// data: {
// name: "Toys and Games",
// subcategories: {
//   create: [
//     { name: "Toys for Kids" },
//     { name: "Board Games" },
//     { name: "Puzzles" },
//     { name: "Educational Toys" },
//     { name: "Outdoor Play" },
//   ],
// },
// },
//  });
//  await db.category.create({
//     data: {
//       name: "Automotive",
//       subcategories: {
//         create: [
//           { name: "Car Parts and Accessories" },
//           { name: "Tools and Equipment" },
//           { name: "Car Care Products" },
//           { name: "Electronics for Cars" },
//         ],
//       },
//     },
//  });
//  await db.category.create({
//     data: {
//       name: "Pet Supplies",
//       subcategories: {
//         create: [
//           { name: "Pet Food" },
//           { name: "Pet Accessories" },
//           { name: "Pet Care Products" },
//           { name: "Pet Toys" },
//         ],
//       },
//     },
//  });
//  await db.category.create({
//     data: {
//       name: "Jewelry",
//       subcategories: {
//         create: [
//           { name: "Necklaces" },
//           { name: "Earrings" },
//           { name: "Bracelets" },
//           { name: "Rings" },
//           { name: "Watches" },
//         ],
//       },
//     },
//  });
//  await db.category.create({
//     data: {
//       name: "Specialty Foods",
//       subcategories: {
//         create: [
//           { name: "Gourmet Foods" },
//           { name: "Organic Products" },
//           { name: "Snacks and Treats" },
//           { name: "Beverages" },
//         ],
//       },
//     },
//  });
//  await db.category.create({
//     data: {
//       name: "Gifts and Occasions",
//       subcategories: {
//         create: [
//           { name: "Gift Cards" },
//           { name: "Gift Sets" },
//           { name: "Seasonal Gifts" },
//           { name: "Personalized Gifts" },
//         ],
//       },
//     },
//  });