require 'test_helper'

class CharacterTest < ActiveSupport::TestCase
  test "only name is required" do
    character = Character.new
    assert character.invalid?
    assert character.errors[:name].any?
  end

  test "name is unique" do
  	character = Character.new
  	character.name = characters(:darth_vader).name
  	character.save
  	assert character.invalid?
  	assert character.errors[:name].any?

  end
end
