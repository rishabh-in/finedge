const fs = require('fs/promises');
const path = require('path');
const config = require('../config/env');

const defaultData = {
  users: [],
  transactions: [],
  budgets: [],
};

const ensureDataFile = async () => {
  await fs.mkdir(path.dirname(config.dataFile), { recursive: true });

  try {
    await fs.access(config.dataFile);
  } catch (error) {
    await fs.writeFile(config.dataFile, JSON.stringify(defaultData, null, 2));
  }
};

const readData = async () => {
  await ensureDataFile();
  const content = await fs.readFile(config.dataFile, 'utf8');
  return {
    ...defaultData,
    ...JSON.parse(content || '{}'),
  };
};

const writeData = async (data) => {
  await ensureDataFile();
  await fs.writeFile(config.dataFile, JSON.stringify(data, null, 2));
};

const findAll = async (collection) => {
  const data = await readData();
  return data[collection] || [];
};

const findById = async (collection, id) => {
  const items = await findAll(collection);
  return items.find((item) => item.id === id) || null;
};

const insert = async (collection, item) => {
  const data = await readData();
  data[collection] = [...(data[collection] || []), item];
  await writeData(data);
  return item;
};

const updateById = async (collection, id, item) => {
  const data = await readData();
  data[collection] = (data[collection] || []).map((currentItem) => (currentItem.id === id ? item : currentItem));
  await writeData(data);
  return item;
};

const deleteById = async (collection, id) => {
  const data = await readData();
  data[collection] = (data[collection] || []).filter((item) => item.id !== id);
  await writeData(data);
};

module.exports = {
  findAll,
  findById,
  insert,
  updateById,
  deleteById,
};
