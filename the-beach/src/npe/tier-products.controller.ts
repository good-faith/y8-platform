import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { TierProductsService, TierProduct, AddonProduct, FeatureCategory } from './tier-products.service';
import { NPETier } from './npe-tier-manager.service';

/**
 * Tier Products Controller
 * 
 * REST API for accessing tier products, pricing, and feature comparisons
 */
@Controller('npe/products')
export class TierProductsController {
  private readonly logger = new Logger(TierProductsController.name);

  constructor(private readonly productsService: TierProductsService) {}

  /**
   * Get all tier products
   * GET /npe/products
   */
  @Get()
  getAllProducts(): {
    products: TierProduct[];
    comparison: any;
  } {
    this.logger.log('📦 Getting all tier products');
    
    return {
      products: this.productsService.getAllTierProducts(),
      comparison: this.productsService.getPricingComparison(),
    };
  }

  /**
   * Get specific tier product
   * GET /npe/products/:tier
   */
  @Get(':tier')
  getProduct(@Param('tier') tier: string): TierProduct {
    this.logger.log(`📦 Getting product for tier: ${tier}`);
    
    const tierEnum = tier.toUpperCase() as NPETier;
    return this.productsService.getTierProduct(tierEnum);
  }

  /**
   * Get pricing comparison
   * GET /npe/products/pricing/comparison
   */
  @Get('pricing/comparison')
  getPricingComparison() {
    this.logger.log('💰 Getting pricing comparison');
    return this.productsService.getPricingComparison();
  }

  /**
   * Get feature comparison
   * GET /npe/products/features/comparison?category=agents
   */
  @Get('features/comparison')
  getFeatureComparison(@Query('category') category?: string) {
    this.logger.log(`🔍 Getting feature comparison${category ? ` for category: ${category}` : ''}`);
    
    const categoryEnum = category?.toUpperCase() as FeatureCategory | undefined;
    const comparison = this.productsService.compareFeatures(categoryEnum);
    
    return {
      category: category || 'all',
      features: Object.fromEntries(comparison),
    };
  }

  /**
   * Get available add-ons for a tier
   * GET /npe/products/:tier/addons
   */
  @Get(':tier/addons')
  getAvailableAddons(@Param('tier') tier: string): AddonProduct[] {
    this.logger.log(`🧩 Getting addons for tier: ${tier}`);
    
    const tierEnum = tier.toUpperCase() as NPETier;
    return this.productsService.getAvailableAddons(tierEnum);
  }

  /**
   * Calculate total price with add-ons
   * GET /npe/products/:tier/calculate?addons=extra-npes-10,priority-support
   */
  @Get(':tier/calculate')
  calculatePrice(
    @Param('tier') tier: string,
    @Query('addons') addons?: string,
  ): {
    tier: string;
    basePrice: number;
    addons: { id: string; name: string; price: number }[];
    totalPrice: number;
    currency: string;
  } {
    this.logger.log(`💵 Calculating price for tier: ${tier} with addons: ${addons}`);
    
    const tierEnum = tier.toUpperCase() as NPETier;
    const addonIds = addons ? addons.split(',').map(a => a.trim()) : [];
    
    const product = this.productsService.getTierProduct(tierEnum);
    const totalPrice = this.productsService.calculateTotalPrice(tierEnum, addonIds);
    
    const addonDetails = addonIds.map(id => {
      const addon = this.productsService.getAddon(id);
      return addon ? { id, name: addon.name, price: addon.price } : null;
    }).filter(Boolean) as { id: string; name: string; price: number }[];
    
    return {
      tier,
      basePrice: product.pricing.monthly,
      addons: addonDetails,
      totalPrice,
      currency: product.pricing.currency,
    };
  }

  /**
   * Get product features by category
   * GET /npe/products/:tier/features/:category
   */
  @Get(':tier/features/:category')
  getFeaturesByCategory(
    @Param('tier') tier: string,
    @Param('category') category: string,
  ) {
    this.logger.log(`🏷️ Getting ${category} features for tier: ${tier}`);
    
    const tierEnum = tier.toUpperCase() as NPETier;
    const categoryEnum = category.toUpperCase() as FeatureCategory;
    const product = this.productsService.getTierProduct(tierEnum);
    
    return {
      tier,
      category,
      features: product.features.filter(f => f.category === categoryEnum),
    };
  }

  /**
   * Get quotas for a tier
   * GET /npe/products/:tier/quotas
   */
  @Get(':tier/quotas')
  getQuotas(@Param('tier') tier: string) {
    this.logger.log(`📊 Getting quotas for tier: ${tier}`);
    
    const tierEnum = tier.toUpperCase() as NPETier;
    const product = this.productsService.getTierProduct(tierEnum);
    
    return {
      tier,
      quotas: product.quotas,
    };
  }

  /**
   * Get marketing info for a tier
   * GET /npe/products/:tier/marketing
   */
  @Get(':tier/marketing')
  getMarketing(@Param('tier') tier: string) {
    this.logger.log(`📢 Getting marketing info for tier: ${tier}`);
    
    const tierEnum = tier.toUpperCase() as NPETier;
    const product = this.productsService.getTierProduct(tierEnum);
    
    return {
      tier,
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      marketing: product.marketing,
      cta: product.cta,
      trial: product.trial,
    };
  }

  /**
   * Get all feature categories
   * GET /npe/products/categories/list
   */
  @Get('categories/list')
  getCategories() {
    this.logger.log('📑 Getting all feature categories');
    
    return {
      categories: Object.values(FeatureCategory).map(cat => ({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
      })),
    };
  }
}
