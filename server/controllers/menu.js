'use strict';

const { get, has, isEmpty } = require( 'lodash' );
const { ValidationError } = require( '@strapi/utils' ).errors;

const { getService, serializeNestedMenu } = require( '../utils' );

module.exports = {
  async config( ctx ) {
    const config = await getService( 'menu' ).getConfig();

    ctx.send( { config } );
  },

  async find( ctx ) {
    const nested = has( ctx.request.query, 'nested' );
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
    const nested = has( ctx.request.query, 'nested' );

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

  async create( ctx ) {
    if ( isEmpty( ctx.request.body ) ) {
      throw new ValidationError( 'Request body cannot be empty' );
    }

    const slug = ctx.request.body.slug;
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

    const id = ctx.params.id;
    const menuToUpdate = await getService( 'menu' ).getMenu( id );

    if ( ! menuToUpdate ) {
      return ctx.notFound();
    }

    const slug = ctx.request.body.slug;
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
    const id = ctx.params.id;
    const menuToDelete = await getService( 'menu' ).getMenu( id );

    if ( ! menuToDelete ) {
      return ctx.notFound();
    }

    await getService( 'menu' ).deleteMenu( id );

    ctx.send( { ok: true } );
  },
};
