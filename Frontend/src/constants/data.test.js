import { featuredCollections, recentDocuments, categories } from './data';

describe('Data Structures', () => {
  describe('featuredCollections', () => {
    test('should be an array with correct structure', () => {
      expect(Array.isArray(featuredCollections)).toBe(true);
      expect(featuredCollections.length).toBe(3);
      
      featuredCollections.forEach(collection => {
        expect(collection).toHaveProperty('id');
        expect(collection).toHaveProperty('title');
        expect(collection).toHaveProperty('description');
        expect(collection).toHaveProperty('image');
        expect(collection).toHaveProperty('count');
        expect(collection).toHaveProperty('color');
        
        expect(typeof collection.id).toBe('number');
        expect(typeof collection.title).toBe('string');
        expect(typeof collection.description).toBe('string');
        expect(typeof collection.image).toBe('string');
        expect(typeof collection.count).toBe('number');
        expect(typeof collection.color).toBe('string');
      });
    });
    
    test('should contain South African Constitution', () => {
      const saConstitution = featuredCollections.find(c => c.title === "South African Constitution");
      expect(saConstitution).toBeDefined();
      expect(saConstitution.description).toContain('South African constitutional documents');
    });
  });
  
  describe('recentDocuments', () => {
    test('should be an array with correct structure', () => {
      expect(Array.isArray(recentDocuments)).toBe(true);
      expect(recentDocuments.length).toBe(4);
      
      recentDocuments.forEach(document => {
        expect(document).toHaveProperty('id');
        expect(document).toHaveProperty('title');
        expect(document).toHaveProperty('description');
        expect(document).toHaveProperty('date');
        expect(document).toHaveProperty('category');
        expect(document).toHaveProperty('color');
        
        expect(typeof document.id).toBe('number');
        expect(typeof document.title).toBe('string');
        expect(typeof document.description).toBe('string');
        expect(typeof document.date).toBe('string');
        expect(typeof document.category).toBe('string');
        expect(typeof document.color).toBe('string');
        
        // Verify date format (YYYY-MM-DD)
        expect(document.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
    
    test('should contain documents from 2023', () => {
      const docs2023 = recentDocuments.filter(doc => doc.date.startsWith('2023'));
      expect(docs2023.length).toBe(recentDocuments.length);
    });
  });
  
  describe('categories', () => {
    test('should be an array with correct structure', () => {
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBe(8);
      
      categories.forEach(category => {
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('count');
        expect(category).toHaveProperty('icon');
        expect(category).toHaveProperty('color');
        
        expect(typeof category.name).toBe('string');
        expect(typeof category.count).toBe('number');
        expect(typeof category.icon).toBe('string');
        expect(typeof category.color).toBe('string');
      });
    });
    
    test('should contain essential constitutional categories', () => {
      const categoryNames = categories.map(c => c.name);
      expect(categoryNames).toContain('Constitutions');
      expect(categoryNames).toContain('Amendments');
      expect(categoryNames).toContain('Judicial Decisions');
    });
  });
});