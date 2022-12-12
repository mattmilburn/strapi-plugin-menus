'use strict';

const isObject = require( 'lodash/isObject' );
const { createCoreController } = require('@strapi/strapi').factories;
const { ValidationError } = require( '@strapi/utils' ).errors;

const { UID_MENU } = require( '../constants' );
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
    const { query } = ctx.request;
    const { data, files } = parseBody( ctx );

    if ( ! isObject( data ) ) {
      throw new ValidationError( 'Missing "data" payload in the request body' );
    }

    // Validate slug availability.
    const isAvailable = await getService( 'uid' ).checkAvailability( data.slug );

    if ( ! isAvailable ) {
      const errorMessage = `The slug ${data.slug} is already taken`;
      return ctx.badRequest( errorMessage, { slug: {
        id: 'menus.error.slug.taken',
        defaultMessage: errorMessage,
        values: { slug: data.slug },
      } } );
    }

    // Set vars related to nesting data.
    const isNested = Object.keys( query ).includes( 'nested' );
    const params = isNested ? getNestedParams( query ) : query;
    const keepParentData = hasParentPopulation( query );

    // Create new menu.
    const sanitizedInputData = await this.sanitizeInput( data, ctx );
    const entity = await getService( 'menu' ).create( {
      ...params,
      data: sanitizedInputData,
      files,
    } );
    const sanitizedEntity = await this.sanitizeOutput( entity, ctx );
    const transformedEntity = this.transformResponse( sanitizedEntity );

    // Maybe return results in a nested format.
    if ( isNested ) {
      return serializeNestedMenu( transformedEntity, keepParentData );
    }

    return transformedEntity;
  },

  async update( ctx ) {
    const { id } = ctx.params;
    const { query } = ctx.request;
    const { data, files } = parseBody( ctx );

    if ( ! isObject( data ) ) {
      throw new ValidationError( 'Missing "data" payload in the request body' );
    }

    // Validate slug availability.
    const isAvailable = await getService( 'uid' ).checkAvailability( data.slug, id );

    if ( ! isAvailable ) {
      const errorMessage = `The slug ${data.slug} is already taken`;
      return ctx.badRequest( errorMessage, { slug: {
        id: 'menus.error.slug.taken',
        defaultMessage: errorMessage,
        values: { slug: data.slug },
      } } );
    }

    // Set vars related to nesting data.
    const isNested = Object.keys( query ).includes( 'nested' );
    const params = isNested ? getNestedParams( query ) : query;
    const keepParentData = hasParentPopulation( query );

    // Update menu.
    const sanitizedInputData = await this.sanitizeInput( data, ctx );
    const entity = await getService( 'menu' ).update( id, {
      ...params,
      data: sanitizedInputData,
      files,
    } );
    const sanitizedEntity = await this.sanitizeOutput( entity, ctx );
    const transformedEntity = this.transformResponse( sanitizedEntity );

    // Maybe return results in a nested format.
    if ( isNested ) {
      return serializeNestedMenu( transformedEntity, keepParentData );
    }

    return transformedEntity;
  },
} ) );
