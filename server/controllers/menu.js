'use strict';

const { get, isObject } = require( 'lodash' );
const { prop, pick } = require( 'lodash/fp' );
const { createCoreController } = require('@strapi/strapi').factories;
const { ValidationError } = require( '@strapi/utils' ).errors;
const { PUBLISHED_AT_ATTRIBUTE } = require('@strapi/utils').contentTypes.constants;

const { UID_MENU, UID_MENU_ITEM } = require( '../constants' );
const {
  getNestedParams,
  getService,
  hasParentPopulation,
  parseBody,
  serializeNestedMenu,
} = require( '../utils' );

module.exports = createCoreController( UID_MENU, ( { strapi } ) =>  ( {
  async config( ctx ) {
    const service = getService( 'plugin' );
    const config = await service.getConfig();
    const schema = await service.getSchema();

    ctx.send( {
      config,
      schema,
    } );
  },

  async findRelations( ctx ) {
    const { targetField } = ctx.params;
    const { query } = ctx.request;
    const contentManager = strapi.plugin( 'content-manager' );
    const contentTypes = contentManager.service( 'content-types' );
    const entityManager = contentManager.service( 'entity-manager' );

    if ( ! targetField ) {
      return ctx.badRequest();
    }

    const modelDef = strapi.getModel( UID_MENU_ITEM );

    if ( ! modelDef ) {
      return ctx.notFound( 'model.notFound' );
    }

    const attribute = modelDef.attributes[ targetField ];

    if ( ! attribute || attribute.type !== 'relation' ) {
      return ctx.badRequest( 'targetField.invalid' );
    }

    const target = strapi.getModel( attribute.target );

    if ( ! target ) {
      return ctx.notFound( 'target.notFound' );
    }

    const entities = await entityManager.find( query, target.uid, [] );

    if ( ! entities ) {
      return ctx.notFound();
    }

    const modelConfig = await contentTypes.findConfiguration( modelDef );
    const field = prop( `metadatas.${targetField}.edit.mainField`, modelConfig ) || 'id';
    const pickFields = [ field, 'id', target.primaryKey, PUBLISHED_AT_ATTRIBUTE ];

    ctx.send( entities.map( pick( pickFields ) ) );
  },

  //////////////////////////////////////////////////////////////////////////////

  async find( ctx ) {
    const { query } = ctx;

    const isNested = Object.keys( query ).includes( 'nested' );
    const params = isNested ? getNestedParams( query ) : query;
    const keepParentData = hasParentPopulation( query );

    const { results, pagination } = await getService( 'menu' ).find( params );
    const sanitizedResults = await this.sanitizeOutput( results, ctx );
    const transformedResults = this.transformResponse( sanitizedResults, { pagination } );

    // Maybe return results in a nested format.
    if ( isNested ) {
      return serializeNestedMenu( transformedResults, keepParentData );
    }

    return transformedResults;
  },

  async findOne( ctx ) {
    const { id } = ctx.params;
    const { query } = ctx;

    const isNested = Object.keys( query ).includes( 'nested' );
    const params = isNested ? getNestedParams( query ) : query;
    const keepParentData = hasParentPopulation( query );

    const entity = await getService( 'menu' ).findOne( id, params );
    const sanitizedEntity = await this.sanitizeOutput( entity, ctx );
    const transformedEntity = this.transformResponse( sanitizedEntity );

    // Maybe return results in a nested format.
    if ( isNested ) {
      return serializeNestedMenu( transformedEntity, keepParentData );
    }

    return transformedEntity;
  },

  async create( ctx ) {
    const { data } = parseBody( ctx );

    if ( ! isObject( data ) ) {
      throw new ValidationError( 'Missing "data" payload in the request body' );
    }

    // Validate slug availability.
    const isAvailable = await getService( 'menu' ).checkAvailability( data.slug );

    if ( ! isAvailable ) {
      const errorMessage = `The slug ${data.slug} is already taken`;
      return ctx.badRequest( errorMessage, { slug: errorMessage } );
    }

    return await super.create( ctx );
  },

  async update( ctx ) {
    const { id } = ctx.params;
    const { data } = parseBody( ctx );

    if ( ! isObject( data ) ) {
      throw new ValidationError( 'Missing "data" payload in the request body' );
    }

    // Validate slug availability.
    const isAvailable = await getService( 'menu' ).checkAvailability( data.slug, id );

    if ( ! isAvailable ) {
      const errorMessage = `The slug ${data.slug} is already taken`;
      return ctx.badRequest( errorMessage, { slug: errorMessage } );
    }

    return await super.update( ctx );
  },
} ) );
