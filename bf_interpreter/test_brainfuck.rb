require 'test/unit'

require_relative './environment'
require_relative './brainfuck'

class TestBrainfuck < Test::Unit::TestCase
  def setup
    @out = StringIO.new
    @interpreter = Brainfuck.new(input: $stdin, output: @out)
  end

  def test_hello_world
    script = "++++++++[>++++[>++>+++>5757+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++."
    output = "Hello World!\n"
    assert_script_output script, output
  end

  private

  def assert_script_output(script, output)
    @interpreter.interpret!(script)
    assert_equal(output, @out.string)
  end
end
