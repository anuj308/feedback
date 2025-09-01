import mongoose from 'mongoose';
import { Form } from '../models/from.model.js';
import { Store } from '../models/store.model.js';

// Database migration script to fix question type naming inconsistencies
const fixQuestionTypes = async () => {
  try {
    console.log('🔄 Starting question type migration...');
    
    // Mapping of old types to new types
    const typeMapping = {
      'short-answer': 'shortAnswer',
      'short_answer': 'shortAnswer',
      'multiple-choice': 'multipleChoice',
      'multiple_choice': 'multipleChoice',
      'file-upload': 'fileUpload',
      'file_upload': 'fileUpload',
      'checkboxes': 'checkbox'
    };
    
    // Fix Form collection
    const forms = await Form.find({});
    let formsUpdated = 0;
    
    for (const form of forms) {
      let needsUpdate = false;
      
      if (form.questions && form.questions.length > 0) {
        form.questions.forEach(question => {
          if (typeMapping[question.type]) {
            console.log(`📝 Updating question type: ${question.type} → ${typeMapping[question.type]}`);
            question.type = typeMapping[question.type];
            needsUpdate = true;
          }
        });
      }
      
      if (needsUpdate) {
        await form.save();
        formsUpdated++;
        console.log(`✅ Updated form: ${form.formTitle} (${form._id})`);
      }
    }
    
    console.log(`✅ Migration completed! Updated ${formsUpdated} forms.`);
    
    // Optionally check for any remaining invalid types
    const formsWithInvalidTypes = await Form.find({
      'questions.type': { 
        $nin: ['shortAnswer', 'paragraph', 'multipleChoice', 'checkbox', 'dropdown', 'fileUpload', 'linearScale', 'multipleChoiceGrid'] 
      }
    });
    
    if (formsWithInvalidTypes.length > 0) {
      console.warn(`⚠️ Found ${formsWithInvalidTypes.length} forms with invalid question types:`);
      formsWithInvalidTypes.forEach(form => {
        form.questions.forEach(question => {
          if (!['shortAnswer', 'paragraph', 'multipleChoice', 'checkbox', 'dropdown', 'fileUpload', 'linearScale', 'multipleChoiceGrid'].includes(question.type)) {
            console.warn(`   - Form: ${form.formTitle}, Question: ${question.question}, Type: ${question.type}`);
          }
        });
      });
    } else {
      console.log('✅ All question types are now valid!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export default fixQuestionTypes;

// If running this file directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/feedback';
  
  mongoose.connect(mongoUri)
    .then(() => {
      console.log('📊 Connected to MongoDB');
      return fixQuestionTypes();
    })
    .then(() => {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}
