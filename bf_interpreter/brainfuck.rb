require_relative './environment'

class Brainfuck
  def initialize(input:, output:)
    @input = input
    @output = output
  end

  def interpret!(script)
    # data_array = Array.new(20, 0)
    data_array = Array.new(30_000, 0)
    data_pointer = 0
    hash_forward = { 0 => 5, 1 => 15, }
    hash_back = { 5 => 0, 1 => 15, }

    current_command = nil
    instruction_pointer = 0
    script_length = script.length

    while instruction_pointer < script_length
      current_command = script[instruction_pointer]

      # puts current_command
      # puts data_array.join(' ')

      case current_command
      when 'G'
        # i = 0

        # while i < data_array[data_pointer]
        #   instruction_pointer += 1
        # end
      when '>'
        data_pointer += 1
      when '<'
        data_pointer -= 1
      when '+'
        data_array[data_pointer] += 1
      when '-'
        data_array[data_pointer] -= 1
      when '.'
        # puts(data_array[data_pointer])
        @output.print(data_array[data_pointer].chr)
      when ','
        data_array[data_pointer] = @input.readbyte
      when '['
        if data_array[data_pointer] == 0
          parens_needing_match = 1

          while parens_needing_match > 0
            instruction_pointer += 1
            intermediate_command = script[instruction_pointer]

            if instruction_command == '['
              parens_needing_match += 1
            elsif instruction_command == ']'
              parens_needing_match -= 1
            end
          end
        end
      when ']'
        if data_array[data_pointer] != 0
          parens_needing_match = 1

          while parens_needing_match > 0
            instruction_pointer -= 1
            intermediate_command = script[instruction_pointer]

            if intermediate_command == '['
              parens_needing_match -= 1
            elsif intermediate_command == ']'
              parens_needing_match += 1
            end
          end
        end
      end

      instruction_pointer += 1
    end
  end
end
