import fs from 'fs';
import path from 'path';
import { getDbMode, mockDataDir } from '../config/db.js';

// Helper to generate a random 24-character hex ID (similar to MongoDB ObjectId)
const generateId = () => {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

const getFilePath = (collectionName) => {
  return path.join(mockDataDir, `${collectionName}.json`);
};

const readJson = (collectionName) => {
  const filePath = getFilePath(collectionName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (error) {
    console.error(`Error reading mock JSON file ${filePath}:`, error);
    return [];
  }
};

const writeJson = (collectionName, data) => {
  const filePath = getFilePath(collectionName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const dbHelper = {
  find: async (model, query = {}, populateFields = []) => {
    if (!getDbMode()) {
      let q = model.find(query);
      for (const field of populateFields) {
        q = q.populate(field);
      }
      return await q.exec();
    }

    const collectionName = model.modelName.toLowerCase() + 's';
    let items = readJson(collectionName);

    // Apply filtering
    if (Object.keys(query).length > 0) {
      items = items.filter(item => {
        // Special case for $or operator at root
        if (query.$or) {
          const matchOr = query.$or.some(orCondition => {
            return Object.keys(orCondition).every(key => item[key] === orCondition[key] || (item[key]?._id && item[key]._id === orCondition[key]));
          });
          if (!matchOr) return false;
        }

        for (const key in query) {
          if (key === '$or') continue;
          
          if (query[key] !== undefined) {
            const queryValue = query[key];
            
            // Support $in operator
            if (queryValue && typeof queryValue === 'object' && queryValue.$in) {
               const itemValueId = item[key]?._id || item[key];
               if (!queryValue.$in.includes(itemValueId)) return false;
               continue;
            }

            // Simple equality check (handle populated _id comparison)
            const itemValue = item[key]?._id || item[key];
            if (itemValue !== queryValue) {
              if (Array.isArray(item[key]) && item[key].includes(queryValue)) {
                continue;
              }
              return false;
            }
          }
        }
        return true;
      });
    }

    // Apply population
    if (populateFields.length > 0) {
      for (const field of populateFields) {
        items = items.map(item => {
          if (item[field]) {
            const refCollection = field + 's';
            const refItems = readJson(refCollection);
            if (Array.isArray(item[field])) {
              item[field] = item[field].map(id => refItems.find(r => r._id === id) || id);
            } else {
              item[field] = refItems.find(r => r._id === item[field]) || item[field];
            }
          }
          return item;
        });
      }
    }

    return items;
  },

  findOne: async (model, query = {}, populateFields = []) => {
    if (!getDbMode()) {
      let q = model.findOne(query);
      for (const field of populateFields) {
        q = q.populate(field);
      }
      return await q.exec();
    }

    const items = await dbHelper.find(model, query, populateFields);
    return items.length > 0 ? items[0] : null;
  },

  findById: async (model, id, populateFields = []) => {
    if (!getDbMode()) {
      let q = model.findById(id);
      for (const field of populateFields) {
        q = q.populate(field);
      }
      return await q.exec();
    }

    return await dbHelper.findOne(model, { _id: id }, populateFields);
  },

  create: async (model, data) => {
    if (!getDbMode()) {
      return await model.create(data);
    }

    const collectionName = model.modelName.toLowerCase() + 's';
    const items = readJson(collectionName);
    const newItem = {
      _id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    writeJson(collectionName, items);
    return newItem;
  },

  findByIdAndUpdate: async (model, id, updateData, options = { new: true }) => {
    if (!getDbMode()) {
      return await model.findByIdAndUpdate(id, updateData, options);
    }

    const collectionName = model.modelName.toLowerCase() + 's';
    const items = readJson(collectionName);
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeJson(collectionName, items);
    return items[index];
  },

  findByIdAndDelete: async (model, id) => {
    if (!getDbMode()) {
      return await model.findByIdAndDelete(id);
    }

    const collectionName = model.modelName.toLowerCase() + 's';
    const items = readJson(collectionName);
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;

    const deletedItem = items[index];
    items.splice(index, 1);
    writeJson(collectionName, items);
    return deletedItem;
  },

  save: async (model, document) => {
    if (!getDbMode()) {
      return await document.save();
    }
    if (document._id) {
      return await dbHelper.findByIdAndUpdate(model, document._id, document);
    } else {
      return await dbHelper.create(model, document);
    }
  }
};

export default dbHelper;
export { generateId };
