const { MongoClient } = require('mongodb');

async function fixPhoneIndex() {
  const client = new MongoClient('mongodb+srv://alfinreji10:F9SSj7hskbTbm9Dk@cluster0.wu4hkbk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('test'); // or your database name
    const collection = db.collection('users');
    
    // Drop the existing phone index
    try {
      await collection.dropIndex('phone_1');
      console.log('Dropped existing phone index');
    } catch (error) {
      console.log('Phone index may not exist:', error.message);
    }
    
    // Update existing users with empty phone to null
    const result = await collection.updateMany(
      { phone: { $in: ['', null] } },
      { $unset: { phone: 1 } }
    );
    console.log(`Updated ${result.modifiedCount} users to remove empty phone fields`);
    
    // Create new sparse index for phone
    await collection.createIndex(
      { phone: 1 }, 
      { unique: true, sparse: true }
    );
    console.log('Created new sparse phone index');
    
    console.log('Database fix completed successfully!');
    
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await client.close();
  }
}

fixPhoneIndex();
