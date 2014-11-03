require 'net/http'
require 'time'

count = {}
%w(http://jbbs.shitaraba.net/computer/38153/storage/1205557370.html http://jbbs.shitaraba.net/bbs/read.cgi/computer/38153/1307542890/ http://jbbs.shitaraba.net/bbs/read.cgi/computer/38153/1356424308/).each do |url|
    log = Net::HTTP.get(URI.parse(url))
    log.force_encoding(Encoding::CP51932).encode!('UTF-8', invalid: :replace, undef: :replace)
    i = 0
    log.lines do |line|
        i += 1
        if m = line.match(%r|(\d+/\d+/\d+\(.\)) (\d+:\d+:\d+)|)
            id = Time.parse("#{m[1]} #{m[2]}").strftime('%Y/%m/%d')
            count[id] = (count[id] || 0) + 1
        end
    end
end
keys = count.keys.sort
min, max = Time.parse(keys.first), Time.parse(keys.last)
while true
    id = min.strftime('%Y/%m/%d')
    puts "#{id},#{if count[id] then count[id] else 0 end}"
    min += 60 * 60 * 24
    break if min > max
end
