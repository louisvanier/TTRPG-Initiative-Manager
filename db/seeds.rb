# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

Character.delete_all

Character.create(name: 'Darth Maul', description: 'Shittiest death evar')
Character.create(name: 'Obi-Wan Kenobi', description: 'The younger alive incarnation')