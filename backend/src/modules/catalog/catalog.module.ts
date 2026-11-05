import { Controller, Get, Inject, Module } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CATALOG_LOOKUP, CatalogLookup } from './domain/catalog';
import { PrismaCatalogLookup } from './infrastructure/prisma-catalog.lookup';

// El catalogo es de solo lectura y visible para cualquier usuario autenticado.
@ApiTags('catalog')
@ApiBearerAuth()
@Controller()
class CatalogController {
  constructor(@Inject(CATALOG_LOOKUP) private readonly catalog: CatalogLookup) {}

  @Get('periods')
  periods() {
    return this.catalog.listPeriods();
  }

  @Get('catalog')
  tree() {
    return this.catalog.getTree();
  }
}

@Module({
  controllers: [CatalogController],
  providers: [{ provide: CATALOG_LOOKUP, useClass: PrismaCatalogLookup }],
  exports: [CATALOG_LOOKUP],
})
export class CatalogModule {}
