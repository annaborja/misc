require_relative './environment'

# Uses a sliding window rate limiting algorithm.
#
# A sliding window has advantages over a fixed window,
# as a fixed window could let a burst of requests above the threshold through
# if the threshold number of requests were sent at the end of one window and
# then sent again at the beginning of the next window.
class RateLimiter
  class Limited < StandardError; end

  MAX_PERIOD = 10.minutes.freeze

  def initialize(throws:)
    @throws = throws
    @mutex = Mutex.new
    @rate_limit_data = {}
  end

  def limit(name, threshold:, period:)
    raise ArgumentError, "Period [#{period}] exceeds max period [#{MAX_PERIOD}]" if period > MAX_PERIOD

    rate_limit_datum = nil

    # Make the hash containing data for all named requests thread-safe.
    @mutex.synchronize do
      @rate_limit_data[name] ||= {}
      rate_limit_datum = @rate_limit_data.fetch(name)

      rate_limit_datum[:mutex] ||= Mutex.new
      rate_limit_datum[:request_counts] ||= {}

      # puts @rate_limit_data
    end

    # Make the data hash for each named request thread-safe.
    rate_limit_datum.fetch(:mutex).synchronize do
      # puts name

      now = Time.now
      current_timestamp = now.to_i
      period_start_timestamp = (now - period).to_i + 1 # Add 1 to make the period include the current second.

      request_counts = rate_limit_datum.fetch(:request_counts)
      request_counts[current_timestamp] ||= 0
      request_counts[current_timestamp] += 1

      prune_request_counts(request_counts, now)

      # puts request_counts

      # TODO: Could save time by assuming ordered keys (see comment in `#prune_request_counts`)
      # instead of using `#select` to iterate through every key in `request_counts`.
      if request_counts.select { |timestamp| timestamp >= period_start_timestamp }.values.sum > threshold
        raise Limited if @throws

        return
      end

      yield
    end
  end

  private

  # Prune logged request counts to save memory.
  # Requests outside the max period are safe to prune.
  # Otherwise, keep all logs since the period can change.
  #
  # NOTE: Even with pruning, our logs could grow quite large since we're potentially inserting a key per second.
  # We could save space if our rate limits were always measured in minutes or hours,
  # since we could then store a key per minute instead of per second.
  # We could also enforce a limit on our log size instead of pruning based on the max period.
  #
  # NOTE: We shouldn't execute this within the `#limit` method, since it takes up time and is not crucial.
  # We should either use an external datastore like Redis, which could asynchronously prune expired data for us,
  # or run this behavior in a background job.
  def prune_request_counts(request_counts, now)
    max_period_start_timestamp = (now - MAX_PERIOD).to_i + 1

    request_counts.keys.each do |timestamp|
      # Ruby hashes are enumerated in order of insertion
      # (see https://stackoverflow.com/questions/11350500/ruby-hash-keys-and-values-safe-to-assume-same-order).
      # In a thread-safe program, we will be inserting keys into the `request_counts` hash in chronological order,
      # so we can save time here by iterating until we hit the timestamp demarcating the max period.
      break if timestamp >= max_period_start_timestamp

      request_counts.delete(timestamp)
    end
  end
end
