require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module InitManager
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Configure Browserify to use babelify to compile ES6
    config.browserify_rails.commandline_options = '-t [ babelify --presets [ es2015 ] ]'

    unless Rails.env.production?
      # Work around sprockets+teaspoon mismatch:
      Rails.application.config.assets.precompile += %w(spec_helper.js)

      # Make sure Browserify is triggered when
      # asked to serve javascript spec files
      config.browserify_rails.paths << lambda do |p|
        p.start_with?(Rails.root.join('spec/javascripts').to_s)
      end
    end

    #add node_modules to assets paths
    config.assets.paths << Rails.root.join('node_modules')

    config.webpack = {
      use_manifest: false,
      asset_manifest: {},
      common_manifest: {},
    }
  end
end
