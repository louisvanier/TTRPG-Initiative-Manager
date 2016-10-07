class AddIsPlayerControlledToCharacters < ActiveRecord::Migration[5.0]
  def change
    add_column :characters, :is_player_controlled, :boolean
  end
end
