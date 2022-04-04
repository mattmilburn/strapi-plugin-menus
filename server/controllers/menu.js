'use strict';

const { get, isEmpty } = require( 'lodash' );
const { prop, pick } = require( 'lodash/fp' );
const { ValidationError } = require( '@strapi/utils' ).errors;
const { PUBLISHED_AT_ATTRIBUTE } = require('@strapi/utils').contentTypes.constants;

const { getService, serializeNestedMenu } = require( '../utils' );

module.exports = {
  async config( ctx ) {
    const config = await getService( 'menu' ).getConfig();

    ctx.send( { config } );
  },

  async find( ctx ) {
    const nested = get( ctx.request.query, 'nested' ) !== 'false';
    const populate = get( ctx.request.query, 'populate' ) !== 'false';

    let menus = await getService( 'menu' ).getMenus( populate );

    // Maybe serialize menus into a nested format, otherwise leave them flat.
    if ( nested ) {
      menus = menus.map( menu => serializeNestedMenu( menu ) );
    }

    ctx.send( { menus } );
  },

  async findOne( ctx ) {
    const { slug } = ctx.request.params;
    const nested = get( ctx.request.query, 'nested' ) !== 'false';

    let menu = await getService( 'menu' ).getMenu( slug, 'slug' );

    if ( ! menu ) {
      return ctx.notFound();
    }

    // Maybe serialize menus into a nested format, otherwise leave them flat.
    if ( nested ) {
      menu = serializeNestedMenu( menu );
    }

    ctx.send( { menu } );
  },

  async findOneById( ctx ) {
    const { id } = ctx.request.params;
    const menu = await getService( 'menu' ).getMenu( id );

    if ( ! menu ) {
      return ctx.notFound();
    }

    ctx.send( { menu } );
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

    const modelDef = strapi.getModel( 'plugin::menus.menu-item' );

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

  async create( ctx ) {
    if ( isEmpty( ctx.request.body ) ) {
      throw new ValidationError( 'Request body cannot be empty' );
    }

    const { slug } = ctx.request.body;
    const isAvailable = await getService( 'menu' ).checkAvailability( slug );

    // Validate slug availability.
    if ( ! isAvailable ) {
      const errorMessage = `The slug ${slug} is already taken`;
      return ctx.badRequest( errorMessage, { slug: errorMessage } );
    }

    const menu = await getService( 'menu' ).createMenu( ctx.request.body );

    ctx.send( { menu } );
  },

  async update( ctx ) {
    if ( isEmpty( ctx.request.body ) ) {
      throw new ValidationError( 'Request body cannot be empty' );
    }

    // Get the entity we are about to update so we can compare it to new data.
    const { id } = ctx.request.params;
    const menuToUpdate = await getService( 'menu' ).getMenu( id );

    if ( ! menuToUpdate ) {
      return ctx.notFound();
    }

    const { slug } = ctx.request.body;
    const isAvailable = await getService( 'menu' ).checkAvailability( slug, id );

    // Validate slug availability.
    if ( ! isAvailable ) {
      const errorMessage = `The slug ${slug} is already taken`;
      return ctx.badRequest( errorMessage, { slug: errorMessage } );
    }

    const menu = await getService( 'menu' ).updateMenu( id, ctx.request.body, menuToUpdate );

    ctx.send( { menu } );
  },

  async delete( ctx ) {
    const { id } = ctx.request.params;
    const menuToDelete = await getService( 'menu' ).getMenu( id );

    if ( ! menuToDelete ) {
      return ctx.notFound();
    }

    await getService( 'menu' ).deleteMenu( id );

    ctx.send( { ok: true } );
  },
};
