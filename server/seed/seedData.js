require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');
const SearchLog = require('../models/SearchLog');
const AvailabilityAlert = require('../models/AvailabilityAlert');

const connectDB = require('../config/db');

const pharmacies = [
  { name: 'Government Pharmacy - Kochi Central', address: 'MG Road, Ernakulam', city: 'Kochi', district: 'Ernakulam', state: 'Kerala', latitude: 9.9312, longitude: 76.2673, phone: '0484-2351234', openingTime: '09:00 AM', closingTime: '06:00 PM' },
  { name: 'Government Pharmacy - Ernakulam General Hospital', address: 'Hospital Road, Ernakulam', city: 'Ernakulam', district: 'Ernakulam', state: 'Kerala', latitude: 9.9816, longitude: 76.2999, phone: '0484-2361234', openingTime: '08:00 AM', closingTime: '08:00 PM' },
  { name: 'Government Pharmacy - Aluva', address: 'Aluva Town, Near Bus Stand', city: 'Aluva', district: 'Ernakulam', state: 'Kerala', latitude: 10.1004, longitude: 76.3570, phone: '0484-2621234', openingTime: '09:00 AM', closingTime: '05:00 PM' },
  { name: 'Government Pharmacy - Thrippunithura', address: 'Hill Palace Road, Thrippunithura', city: 'Thrippunithura', district: 'Ernakulam', state: 'Kerala', latitude: 9.9494, longitude: 76.3418, phone: '0484-2781234', openingTime: '09:00 AM', closingTime: '06:00 PM' },
  { name: 'Government Pharmacy - Kalamassery', address: 'HMT Junction, Kalamassery', city: 'Kalamassery', district: 'Ernakulam', state: 'Kerala', latitude: 10.0525, longitude: 76.3188, phone: '0484-2531234', openingTime: '09:00 AM', closingTime: '05:30 PM' },
  { name: 'Government Pharmacy - Fort Kochi', address: 'Bazaar Road, Fort Kochi', city: 'Fort Kochi', district: 'Ernakulam', state: 'Kerala', latitude: 9.9639, longitude: 76.2426, phone: '0484-2171234', openingTime: '09:30 AM', closingTime: '05:30 PM' },
  { name: 'Government Pharmacy - Mattancherry', address: 'Jew Town Road, Mattancherry', city: 'Mattancherry', district: 'Ernakulam', state: 'Kerala', latitude: 9.9577, longitude: 76.2588, phone: '0484-2241234', openingTime: '09:00 AM', closingTime: '05:00 PM' },
  { name: 'Government Pharmacy - Edappally', address: 'NH Bypass, Edappally', city: 'Edappally', district: 'Ernakulam', state: 'Kerala', latitude: 10.0261, longitude: 76.3125, phone: '0484-2801234', openingTime: '08:30 AM', closingTime: '07:00 PM' },
  { name: 'Government Pharmacy - Kakkanad', address: 'Infopark Road, Kakkanad', city: 'Kakkanad', district: 'Ernakulam', state: 'Kerala', latitude: 10.0159, longitude: 76.3419, phone: '0484-2421234', openingTime: '09:00 AM', closingTime: '06:00 PM' },
  { name: 'Government Pharmacy - Angamaly', address: 'Town Hall Road, Angamaly', city: 'Angamaly', district: 'Ernakulam', state: 'Kerala', latitude: 10.1960, longitude: 76.3860, phone: '0484-2451234', openingTime: '09:00 AM', closingTime: '05:00 PM' }
];

const medicines = [
  { name: 'Paracetamol 500mg', genericName: 'Paracetamol', strength: '500mg', category: 'Analgesic', manufacturer: 'Cipla Ltd', description: 'Used for fever and mild to moderate pain relief.' },
  { name: 'Paracetamol 650mg', genericName: 'Paracetamol', strength: '650mg', category: 'Analgesic', manufacturer: 'Sun Pharma', description: 'Higher strength paracetamol for fever and pain.' },
  { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', strength: '500mg', category: 'Antibiotic', manufacturer: 'Cipla Ltd', description: 'Broad-spectrum antibiotic for bacterial infections.' },
  { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', strength: '250mg', category: 'Antibiotic', manufacturer: 'Dr. Reddys', description: 'Lower dose antibiotic, often used for children.' },
  { name: 'Amlodipine 5mg', genericName: 'Amlodipine', strength: '5mg', category: 'Antihypertensive', manufacturer: 'Lupin Ltd', description: 'Calcium channel blocker for high blood pressure.' },
  { name: 'Metformin 500mg', genericName: 'Metformin', strength: '500mg', category: 'Antidiabetic', manufacturer: 'USV Ltd', description: 'First-line medication for type 2 diabetes.' },
  { name: 'Metformin 1000mg', genericName: 'Metformin', strength: '1000mg', category: 'Antidiabetic', manufacturer: 'USV Ltd', description: 'Higher dose for diabetes management.' },
  { name: 'Cetirizine 10mg', genericName: 'Cetirizine', strength: '10mg', category: 'Antihistamine', manufacturer: 'Cipla Ltd', description: 'Antiallergic for hay fever and urticaria.' },
  { name: 'Omeprazole 20mg', genericName: 'Omeprazole', strength: '20mg', category: 'Antacid', manufacturer: 'Dr. Reddys', description: 'Proton pump inhibitor for acid reflux and ulcers.' },
  { name: 'Azithromycin 500mg', genericName: 'Azithromycin', strength: '500mg', category: 'Antibiotic', manufacturer: 'Alkem Labs', description: 'Macrolide antibiotic for respiratory infections.' },
  { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', strength: '400mg', category: 'Analgesic', manufacturer: 'Abbott India', description: 'NSAID for pain and inflammation.' },
  { name: 'ORS (Oral Rehydration Salts)', genericName: 'ORS', strength: 'Standard', category: 'Rehydration', manufacturer: 'FDC Ltd', description: 'Oral rehydration solution for dehydration.' },
  { name: 'Insulin 40IU', genericName: 'Insulin', strength: '40IU/ml', category: 'Antidiabetic', manufacturer: 'Biocon', description: 'Injectable insulin for diabetes management.' },
  { name: 'Atenolol 50mg', genericName: 'Atenolol', strength: '50mg', category: 'Antihypertensive', manufacturer: 'Cipla Ltd', description: 'Beta blocker for high blood pressure and heart conditions.' },
  { name: 'Diclofenac 50mg', genericName: 'Diclofenac', strength: '50mg', category: 'Analgesic', manufacturer: 'Novartis', description: 'NSAID for pain and inflammation.' },
  { name: 'Ranitidine 150mg', genericName: 'Ranitidine', strength: '150mg', category: 'Antacid', manufacturer: 'GSK', description: 'H2 blocker for acid reflux and ulcers.' },
  { name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', strength: '500mg', category: 'Antibiotic', manufacturer: 'Ranbaxy', description: 'Fluoroquinolone antibiotic for bacterial infections.' },
  { name: 'Losartan 50mg', genericName: 'Losartan', strength: '50mg', category: 'Antihypertensive', manufacturer: 'Torrent', description: 'ARB for high blood pressure.' },
  { name: 'Aspirin 75mg', genericName: 'Aspirin', strength: '75mg', category: 'Antiplatelet', manufacturer: 'Bayer', description: 'Low dose aspirin for cardiovascular protection.' },
  { name: 'Clopidogrel 75mg', genericName: 'Clopidogrel', strength: '75mg', category: 'Antiplatelet', manufacturer: 'Sun Pharma', description: 'Antiplatelet agent for heart disease.' },
  { name: 'Pantoprazole 40mg', genericName: 'Pantoprazole', strength: '40mg', category: 'Antacid', manufacturer: 'Alkem Labs', description: 'PPI for gastric acid reduction.' },
  { name: 'Doxycycline 100mg', genericName: 'Doxycycline', strength: '100mg', category: 'Antibiotic', manufacturer: 'Cipla Ltd', description: 'Tetracycline antibiotic for various infections.' },
  { name: 'Montelukast 10mg', genericName: 'Montelukast', strength: '10mg', category: 'Respiratory', manufacturer: 'Sun Pharma', description: 'Leukotriene receptor antagonist for asthma.' },
  { name: 'Salbutamol Inhaler', genericName: 'Salbutamol', strength: '100mcg', category: 'Respiratory', manufacturer: 'Cipla Ltd', description: 'Bronchodilator inhaler for asthma.' },
  { name: 'Ferrous Sulphate 200mg', genericName: 'Ferrous Sulphate', strength: '200mg', category: 'Supplement', manufacturer: 'Alkem Labs', description: 'Iron supplement for anemia.' }
];

// Generate realistic inventory data
const generateInventory = (pharmacyIds, medicineIds) => {
  const inventory = [];

  for (const pharmacyId of pharmacyIds) {
    // Each pharmacy carries 15-22 medicines
    const numMedicines = 15 + Math.floor(Math.random() * 8);
    const selectedMedicines = [...medicineIds].sort(() => Math.random() - 0.5).slice(0, numMedicines);

    for (const medicineId of selectedMedicines) {
      // Random stock distribution
      const rand = Math.random();
      let quantity, threshold;

      // Find the medicine index to make certain ones consistently out of stock
      const medIndex = medicineIds.indexOf(medicineId);

      // Insulin 40IU (index 12) is OUT OF STOCK everywhere for demo
      if (medIndex === 12) {
        quantity = 0;
        threshold = 10;
      } else if (rand < 0.15) {
        // 15% out of stock
        quantity = 0;
        threshold = 10;
      } else if (rand < 0.35) {
        // 20% low stock
        quantity = Math.floor(Math.random() * 10) + 1;
        threshold = 10;
      } else {
        // 65% in stock
        quantity = Math.floor(Math.random() * 150) + 15;
        threshold = 10;
      }

      // Vary the last updated times
      const hoursAgo = Math.floor(Math.random() * 72);
      const lastUpdated = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

      inventory.push({
        pharmacyId,
        medicineId,
        quantity,
        lowStockThreshold: threshold,
        lastUpdated
      });
    }
  }

  return inventory;
};

const searchQueries = [
  'Paracetamol', 'paracetamol 500', 'Insulin', 'ORS', 'Amoxicillin',
  'fever medicine', 'diabetes', 'blood pressure', 'antibiotic', 'pain killer',
  'Cetirizine', 'Omeprazole', 'cough', 'Metformin', 'Aspirin',
  'Azithromycin', 'Ibuprofen', 'Paracetamol', 'Insulin', 'Paracetamol',
  'Amoxicillin', 'ORS', 'Paracetamol', 'Insulin', 'Metformin',
  'Amlodipine', 'inhaler', 'iron tablets', 'Paracetamol', 'Insulin'
];

async function seed() {
  try {
    await connectDB();
    console.log('🌱 Starting seed...\n');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Pharmacy.deleteMany({}),
      Medicine.deleteMany({}),
      Inventory.deleteMany({}),
      SearchLog.deleteMany({}),
      AvailabilityAlert.deleteMany({})
    ]);
    console.log('✓ Cleared existing data');

    // Create users
    const users = await User.create([
      { name: 'Admin User', email: 'admin@medistock.demo', password: 'Admin@123', role: 'admin', phone: '9876543210' },
      { name: 'Pharmacy Staff - Kochi', email: 'staff@medistock.demo', password: 'Staff@123', role: 'staff', phone: '9876543211' },
      { name: 'Staff Member - Ernakulam', email: 'staff2@medistock.demo', password: 'Staff@123', role: 'staff', phone: '9876543212' },
      { name: 'Staff Member - Aluva', email: 'staff3@medistock.demo', password: 'Staff@123', role: 'staff', phone: '9876543213' },
      { name: 'Rahul Menon', email: 'citizen@medistock.demo', password: 'Citizen@123', role: 'citizen', phone: '9876543214' },
      { name: 'Priya Nair', email: 'priya@medistock.demo', password: 'Citizen@123', role: 'citizen', phone: '9876543215' },
      { name: 'Arun Kumar', email: 'arun@medistock.demo', password: 'Citizen@123', role: 'citizen', phone: '9876543216' },
      { name: 'Lakshmi Devi', email: 'lakshmi@medistock.demo', password: 'Citizen@123', role: 'citizen', phone: '9876543217' },
      { name: 'Suresh Babu', email: 'suresh@medistock.demo', password: 'Citizen@123', role: 'citizen', phone: '9876543218' }
    ]);
    console.log(`✓ Created ${users.length} users`);

    // Create pharmacies
    const createdPharmacies = await Pharmacy.create(pharmacies);
    console.log(`✓ Created ${createdPharmacies.length} pharmacies`);

    // Assign pharmacies to staff users
    await User.findOneAndUpdate({ email: 'staff@medistock.demo' }, { pharmacyId: createdPharmacies[0]._id });
    await User.findOneAndUpdate({ email: 'staff2@medistock.demo' }, { pharmacyId: createdPharmacies[1]._id });
    await User.findOneAndUpdate({ email: 'staff3@medistock.demo' }, { pharmacyId: createdPharmacies[2]._id });

    // Create medicines
    const createdMedicines = await Medicine.create(medicines);
    console.log(`✓ Created ${createdMedicines.length} medicines`);

    // Create inventory
    const pharmacyIds = createdPharmacies.map(p => p._id);
    const medicineIds = createdMedicines.map(m => m._id);
    const inventoryData = generateInventory(pharmacyIds, medicineIds);
    const createdInventory = await Inventory.create(inventoryData);
    console.log(`✓ Created ${createdInventory.length} inventory records`);

    // Create search logs
    const searchLogs = searchQueries.map((query, i) => ({
      query,
      userId: users[4 + (i % 5)]._id,
      searchedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
    }));
    await SearchLog.create(searchLogs);
    console.log(`✓ Created ${searchLogs.length} search logs`);

    // Count stock stats
    const inStock = createdInventory.filter(i => i.quantity > i.lowStockThreshold).length;
    const lowStock = createdInventory.filter(i => i.quantity > 0 && i.quantity <= i.lowStockThreshold).length;
    const outOfStock = createdInventory.filter(i => i.quantity === 0).length;

    console.log('\n📊 Seed Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Pharmacies: ${createdPharmacies.length}`);
    console.log(`   Medicines: ${createdMedicines.length}`);
    console.log(`   Inventory: ${createdInventory.length}`);
    console.log(`   In Stock: ${inStock} | Low Stock: ${lowStock} | Out of Stock: ${outOfStock}`);
    console.log('\n📋 Demo Accounts:');
    console.log('   Admin:   admin@medistock.demo   / Admin@123');
    console.log('   Staff:   staff@medistock.demo   / Staff@123');
    console.log('   Citizen: citizen@medistock.demo / Citizen@123');
    console.log('\n✅ Seed completed successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
