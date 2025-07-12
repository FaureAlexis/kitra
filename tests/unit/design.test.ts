import { describe, it, expect } from 'vitest';
import { DesignEntity } from '@/domain/models/Design';

describe('DesignEntity', () => {
  it('should create a design entity', () => {
    const design = DesignEntity.create({
      name: 'Test Design',
      description: 'A test design',
      createdBy: 'user-123',
      textureUrl: 'https://example.com/texture.jpg',
      ipfsHash: 'QmTest123',
      tags: ['modern', 'blue'],
    });

    expect(design.name).toBe('Test Design');
    expect(design.description).toBe('A test design');
    expect(design.createdBy).toBe('user-123');
    expect(design.textureUrl).toBe('https://example.com/texture.jpg');
    expect(design.ipfsHash).toBe('QmTest123');
    expect(design.tags).toEqual(['modern', 'blue']);
    expect(design.isPublished).toBe(false);
    expect(design.votes).toBe(0);
  });

  it('should publish a design', () => {
    const design = DesignEntity.create({
      name: 'Test Design',
      description: 'A test design',
      createdBy: 'user-123',
      textureUrl: 'https://example.com/texture.jpg',
      ipfsHash: 'QmTest123',
    });

    const publishedDesign = design.publish(42);

    expect(publishedDesign.isPublished).toBe(true);
    expect(publishedDesign.tokenId).toBe(42);
    expect(publishedDesign.name).toBe('Test Design');
  });

  it('should generate correct metadata', () => {
    const design = DesignEntity.create({
      name: 'Test Design',
      description: 'A test design',
      createdBy: 'user-123',
      textureUrl: 'https://example.com/texture.jpg',
      ipfsHash: 'QmTest123',
      tags: ['modern', 'blue'],
    });

    const metadata = design.toMetadata();

    expect(metadata.name).toBe('Test Design');
    expect(metadata.description).toBe('A test design');
    expect(metadata.image).toBe('https://example.com/texture.jpg');
    expect(metadata.attributes).toContainEqual({
      trait_type: 'Creator',
      value: 'user-123',
    });
    expect(metadata.attributes).toContainEqual({
      trait_type: 'Tag',
      value: 'modern',
    });
    expect(metadata.attributes).toContainEqual({
      trait_type: 'Tag',
      value: 'blue',
    });
  });
}); 