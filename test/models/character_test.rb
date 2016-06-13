require 'test_helper'

class CharacterTest < ActiveSupport::TestCase
  test "only name is required" do
    character = Character.new
    assert character.invalid?
    assert character.errors[:name].any?
  end
end
