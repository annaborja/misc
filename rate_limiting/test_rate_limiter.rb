require_relative './environment'
require_relative './rate_limiter'

require 'active_support/testing/time_helpers'

class TestRateLimiter < Test::Unit::TestCase
  include ActiveSupport::Testing::TimeHelpers

  def setup
    @call_counts = {
      foo: 0,
      bar: 0,
      baz: 0
    }
  end

  def teardown
    travel_back
  end

  def test_with_throw
    @rate_limiter = RateLimiter.new(throws: true)

    ##
    # Test basic functionality:
    #  - Can limit multiple named requests (:foo, :bar, :baz) with interleaved calls
    #  - Enforces rate limits when parameters (threshold, period) remain the same
    #
    (1..3).each do |i|
      assert_nothing_raised { request_with_rate_limit(:foo, threshold: 3, period: 1.minute) }
      assert_equal(i, @call_counts[:foo])
    end

    (1..2).each do |i|
      assert_nothing_raised { request_with_rate_limit(:bar, threshold: 3, period: 1.minute) }
      assert_equal(i, @call_counts[:bar])
    end

    (1..2).each do |i|
      assert_nothing_raised { request_with_rate_limit(:baz, threshold: 3, period: 1.minute) }
      assert_equal(i, @call_counts[:baz])
    end

    assert_raise(RateLimiter::Limited) { request_with_rate_limit(:foo, threshold: 3, period: 1.minute) }
    assert_equal(3, @call_counts[:foo])

    assert_nothing_raised { request_with_rate_limit(:bar, threshold: 3, period: 1.minute) }
    assert_equal(3, @call_counts[:bar])
    assert_raise(RateLimiter::Limited) { request_with_rate_limit(:bar, threshold: 3, period: 1.minute) }
    assert_equal(3, @call_counts[:bar])

    # Test that the rate limits reset after their periods pass.
    travel 1.minute

    ##
    # Test more complex functionality:
    #  - Allows for changing threshold and period parameters
    #
    (4..6).each do |i|
      assert_nothing_raised { request_with_rate_limit(:foo, threshold: 3, period: 1.minute) }
      assert_equal(i, @call_counts[:foo])
    end

    assert_nothing_raised { request_with_rate_limit(:bar, threshold: 3, period: 1.minute) }
    assert_equal(4, @call_counts[:bar])

    (3..4).each do |i|
      assert_nothing_raised { request_with_rate_limit(:baz, threshold: 3, period: 1.minute) }
      assert_equal(i, @call_counts[:baz])
    end

    (7..8).each do |i|
      assert_nothing_raised { request_with_rate_limit(:foo, threshold: i - 3, period: 1.minute) }
      assert_equal(i, @call_counts[:foo])
    end

    assert_raise(RateLimiter::Limited) { request_with_rate_limit(:foo, threshold: 3, period: 1.minute) }
    assert_equal(8, @call_counts[:foo])

    assert_raise(RateLimiter::Limited) { request_with_rate_limit(:bar, threshold: 3, period: 3.minutes) }
    assert_equal(4, @call_counts[:bar])
    assert_nothing_raised { request_with_rate_limit(:bar, threshold: 3, period: 1.minute) }
    assert_equal(5, @call_counts[:bar])
    assert_raise(RateLimiter::Limited) { request_with_rate_limit(:bar, threshold: 3, period: 1.minute) }
    assert_equal(5, @call_counts[:bar])

    travel 5.seconds

    (6..8).each do |i|
      assert_nothing_raised { request_with_rate_limit(:bar, threshold: 3, period: 5.seconds) }
      assert_equal(i, @call_counts[:bar])
    end

    assert_raise(RateLimiter::Limited) { request_with_rate_limit(:bar, threshold: 3, period: 5.seconds) }
    assert_equal(8, @call_counts[:bar])

    # Test that the rate limits work after the max period passes
    # (and request counts have been pruned behind the scenes).
    travel RateLimiter::MAX_PERIOD

    assert_nothing_raised { request_with_rate_limit(:foo, threshold: 3, period: RateLimiter::MAX_PERIOD) }
    assert_equal(9, @call_counts[:foo])

    assert_nothing_raised { request_with_rate_limit(:bar, threshold: 3, period: RateLimiter::MAX_PERIOD) }
    assert_equal(9, @call_counts[:bar])

    (5..7).each do |i|
      assert_nothing_raised { request_with_rate_limit(:baz, threshold: 3, period: RateLimiter::MAX_PERIOD) }
      assert_equal(i, @call_counts[:baz])
    end

    assert_raise(RateLimiter::Limited) { request_with_rate_limit(:baz, threshold: 3, period: RateLimiter::MAX_PERIOD) }
    assert_equal(7, @call_counts[:baz])
  end

  def test_without_throw
    @rate_limiter = RateLimiter.new(throws: false)

    (1..3).each do |i|
      assert_nothing_raised { request_with_rate_limit(:foo, threshold: 3, period: 1.minute) }
      assert_equal(i, @call_counts[:foo])
    end

    (1..2).each do |i|
      assert_nothing_raised { request_with_rate_limit(:bar, threshold: 3, period: 1.minute) }
      assert_equal(i, @call_counts[:bar])
    end

    assert_nothing_raised { request_with_rate_limit(:foo, threshold: 3, period: 1.minute) }
    assert_equal(3, @call_counts[:foo])

    assert_nothing_raised { request_with_rate_limit(:bar, threshold: 2, period: 1.minute) }
    assert_equal(2, @call_counts[:bar])

    3.times do
      assert_nothing_raised { request_with_rate_limit(:bar, threshold: 4, period: 1.minute) }
      assert_equal(3, @call_counts[:bar])
    end
  end

  def test_multi_threaded
    @rate_limiter = RateLimiter.new(throws: false)

    [
      20.times.map { Thread.new { request_with_rate_limit(:foo, threshold: 3, period: 1.minute) } },
      15.times.map { Thread.new { request_with_rate_limit(:bar, threshold: 10, period: 1.minute) } },
      10.times.map { Thread.new { request_with_rate_limit(:baz, threshold: 1, period: 1.minute) } }
    ].each { |threads| threads.each(&:join) }

    assert_equal(3, @call_counts[:foo])
    assert_equal(10, @call_counts[:bar])
    assert_equal(1, @call_counts[:baz])

    travel 1.minute

    [
      10.times.map { Thread.new { request_with_rate_limit(:foo, threshold: 20, period: 1.minute) } },
      15.times.map { Thread.new { request_with_rate_limit(:bar, threshold: 15, period: 1.minute) } },
      20.times.map { Thread.new { request_with_rate_limit(:baz, threshold: 5, period: 1.minute) } }
    ].each { |threads| threads.each(&:join) }

    assert_equal(13, @call_counts[:foo])
    assert_equal(25, @call_counts[:bar])
    assert_equal(6, @call_counts[:baz])

    travel 1.minute

    [
      10.times.map { Thread.new { request_with_rate_limit(:foo, threshold: 10, period: 5.minutes) } },
      10.times.map { Thread.new { request_with_rate_limit(:bar, threshold: 15, period: 5.minutes) } },
      10.times.map { Thread.new { request_with_rate_limit(:baz, threshold: 5, period: 1.minute) } }
    ].each { |threads| threads.each(&:join) }

    assert_equal(13, @call_counts[:foo])
    assert_equal(25, @call_counts[:bar])
    assert_equal(11, @call_counts[:baz])
  end

  private

  def request_with_rate_limit(name, threshold:, period:)
    @rate_limiter.limit(name, threshold: threshold, period: period) do
      @call_counts[name] += 1
    end

    # Randomly simulate simultaneous and non-simultaneous requests.
    travel rand(0..1).seconds
  end
end
