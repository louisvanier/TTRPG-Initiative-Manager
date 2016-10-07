class CharactersController < ApplicationController
  before_action :set_character, only: [:show, :edit, :update, :destroy]

  # GET /characters
  # GET /characters.json
  def index
    @characters = Character.all

    respond_to do |format|
      format.json { render json: @characters }
      format.html # index.html.erb
    end
  end

  def show
    @character = Character.find(params[:id])
 
    respond_to do |format|
      format.html # show.html.erb
    end
  end
 
  def new
    @character = Character.new
 
    respond_to do |format|
      format.html # new.html.erb
    end
  end
 
  def edit
    @character = Character.find(params[:id])
  end
 
  def create
    @character = Character.new(character_params)
 
    respond_to do |format|
      if @character.save
        format.html { redirect_to(@character, :notice => 'character was successfully created.') }
        format.json { render :json => @character}
      else
        format.html { render :action => "new" }
        format.json { render :json => @character.errors.to_a, :status => :unprocessable_entity }
      end
    end
  end
 
  def update
    @character = Character.find(params[:id])
 
    respond_to do |format|
      if @character.update_attributes(character_params)
        format.html { redirect_to(@character, :notice => 'character was successfully updated.') }
        format.json { render :json => @character}
      else
        format.html { render :action => "edit" }
        format.json { render :json => @character.errors.to_a, :status => :unprocessable_entity }
      end
    end
  end
 
  def destroy
    @character = Character.find(params[:id])
    @character.destroy
 
    respond_to do |format|
      format.html { redirect_to(characters_url) }
      format.json { render :json => 'ok'.to_json }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_character
      @character = Character.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def character_params
      params.require(:character).permit(:name, :description, :is_player_controlled)
    end
end
