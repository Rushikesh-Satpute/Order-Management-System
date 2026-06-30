import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Store } from './models/Store';
import { FoodItem } from './models/FoodItem';
import { StoreFoodItem } from './models/StoreFoodItem';

// seed data for 5 stores
const storesData = [
  { store_id: 'store_1', name: 'Garwa Hotel', type: 'Family Restaurant' },
  { store_id: 'store_2', name: 'Jagdamba Veg & Non Veg', type: 'Multi Cuisine' },
  { store_id: 'store_3', name: 'Ruchira Hotel', type: 'Breakfast & Meals' },
  { store_id: 'store_4', name: 'Pooja Cafe', type: 'Cafe' },
  { store_id: 'store_5', name: 'Ketli Katta', type: 'Fast Food' },
];

const foodItemsData = [
  { food_id: 'food_1', name: 'Paneer Butter Masala', category: 'Main Course', price: 280 },
  { food_id: 'food_2', name: 'Dal Tadka', category: 'Main Course', price: 180 },
  { food_id: 'food_3', name: 'Butter Chicken', category: 'Non Veg', price: 320 },
  { food_id: 'food_4', name: 'Veg Biryani', category: 'Rice', price: 220 },
  { food_id: 'food_5', name: 'Veg Kolhapuri', category: 'Main Course', price: 250 },
  { food_id: 'food_6', name: 'Thai Green Curry', category: 'Main Course', price: 340 },
  { food_id: 'food_7', name: 'Garlic Naan', category: 'Bread', price: 60 },
  { food_id: 'food_8', name: 'Butter Roti', category: 'Bread', price: 40 },
  { food_id: 'food_9', name: 'Chicken Tikka', category: 'Starter', price: 320 },
  { food_id: 'food_10', name: 'Chicken 65', category: 'Starter', price: 280 },
  { food_id: 'food_11', name: 'Chilli Chicken', category: 'Starter', price: 290 },
  { food_id: 'food_12', name: 'Dragon Paneer', category: 'Starter', price: 240 },
  { food_id: 'food_13', name: 'Chilli Mushroom', category: 'Starter', price: 220 },
  { food_id: 'food_14', name: 'Schezwan Noodles', category: 'Chinese', price: 190 },
  { food_id: 'food_15', name: 'Masala Dosa', category: 'Breakfast', price: 120 },
  { food_id: 'food_16', name: 'Poha', category: 'Breakfast', price: 70 },
  { food_id: 'food_17', name: 'Samosa', category: 'Snacks', price: 30 },
  { food_id: 'food_18', name: 'Cold Coffee', category: 'Beverage', price: 140 },
  { food_id: 'food_19', name: 'Fresh Orange Juice', category: 'Beverage', price: 120 },
  { food_id: 'food_20', name: 'Mango Smoothie', category: 'Beverage', price: 160 },
  { food_id: 'food_21', name: 'Chocolate Brownie', category: 'Dessert', price: 150 },
  { food_id: 'food_22', name: 'Gulab Jamun', category: 'Dessert', price: 80 },
  { food_id: 'food_23', name: 'Peri Peri Fries', category: 'Fast Food', price: 150 },
  { food_id: 'food_24', name: 'Veg Spring Rolls', category: 'Starter', price: 180 },
  { food_id: 'food_25', name: 'Quinoa Veg Salad', category: 'Salad', price: 220 },
];

const storeFoodItemsData = [
  { store_id: 'store_1', food_items: ['food_1', 'food_2', 'food_3', 'food_4', 'food_5', 'food_6', 'food_7', 'food_8', 'food_9'] },
  { store_id: 'store_2', food_items: ['food_1', 'food_3', 'food_4', 'food_7', 'food_8', 'food_9', 'food_10', 'food_11', 'food_14'] },
  { store_id: 'store_3', food_items: ['food_2', 'food_4', 'food_7', 'food_8', 'food_15', 'food_16', 'food_17', 'food_19', 'food_20'] },
  { store_id: 'store_4', food_items: ['food_18', 'food_19', 'food_20', 'food_21', 'food_22', 'food_23', 'food_24', 'food_25'] },
  { store_id: 'store_5', food_items: ['food_10', 'food_11', 'food_12', 'food_13', 'food_14', 'food_17', 'food_23', 'food_24'] },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tmbill';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // wipe existing data first
    await Store.deleteMany({});
    await FoodItem.deleteMany({});
    await StoreFoodItem.deleteMany({});
    console.log('[Seed] Cleared existing data');

    await Store.insertMany(storesData);
    console.log(`[Seed] Inserted ${storesData.length} stores`);

    await FoodItem.insertMany(foodItemsData);
    console.log(`[Seed] Inserted ${foodItemsData.length} food items`);

    await StoreFoodItem.insertMany(storeFoodItemsData);
    console.log(`[Seed] Inserted ${storeFoodItemsData.length} store-food mappings`);

    console.log('[Seed] ✅ Done!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] ❌ Error seeding database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
