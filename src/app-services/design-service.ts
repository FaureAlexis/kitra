import { DesignEntity } from "@/domain/models/Design";
import { UserEntity } from "@/domain/models/User";
import { GenerateKitService } from "./generate-kit";

export interface CreateDesignParams {
  name: string;
  description: string;
  prompt: string;
  style: string;
  colors: string[];
  user: UserEntity;
}

export interface DesignRepository {
  save(design: DesignEntity): Promise<DesignEntity>;
  findById(id: string): Promise<DesignEntity | null>;
  findByUser(userId: string): Promise<DesignEntity[]>;
  findPublished(): Promise<DesignEntity[]>;
  delete(id: string): Promise<void>;
}

export class DesignService {
  constructor(
    private designRepository: DesignRepository,
    private generateKitService: GenerateKitService
  ) {}

  async createDesign(params: CreateDesignParams): Promise<DesignEntity> {
    try {
      // Generate kit using AI
      const generatedKit = await this.generateKitService.generateKit({
        prompt: params.prompt,
        style: params.style,
        colors: params.colors,
        userAddress: params.user.address,
      });

      // Create design entity
      const design = DesignEntity.create({
        name: params.name,
        description: params.description,
        createdBy: params.user.id,
        textureUrl: generatedKit.textureUrl,
        ipfsHash: generatedKit.ipfsHash,
        tags: [params.style, ...params.colors],
      });

      // Save to repository
      return await this.designRepository.save(design);
    } catch (error) {
      console.error("Error creating design:", error);
      throw new Error("Failed to create design");
    }
  }

  async getDesignById(id: string): Promise<DesignEntity | null> {
    return await this.designRepository.findById(id);
  }

  async getUserDesigns(userId: string): Promise<DesignEntity[]> {
    return await this.designRepository.findByUser(userId);
  }

  async getPublishedDesigns(): Promise<DesignEntity[]> {
    return await this.designRepository.findPublished();
  }

  async publishDesign(designId: string, tokenId: number): Promise<DesignEntity> {
    const design = await this.designRepository.findById(designId);
    if (!design) {
      throw new Error("Design not found");
    }

    const publishedDesign = design.publish(tokenId);
    return await this.designRepository.save(publishedDesign);
  }

  async deleteDesign(designId: string, userId: string): Promise<void> {
    const design = await this.designRepository.findById(designId);
    if (!design) {
      throw new Error("Design not found");
    }

    if (design.createdBy !== userId) {
      throw new Error("Unauthorized to delete this design");
    }

    if (design.isPublished) {
      throw new Error("Cannot delete published design");
    }

    await this.designRepository.delete(designId);
  }
} 