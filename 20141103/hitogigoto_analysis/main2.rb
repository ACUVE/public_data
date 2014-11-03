require 'net/http'
require 'time'

count = []
%w(http://jbbs.shitaraba.net/computer/38153/storage/1205557370.html http://jbbs.shitaraba.net/bbs/read.cgi/computer/38153/1307542890/ http://jbbs.shitaraba.net/bbs/read.cgi/computer/38153/1356424308/).each do |url|
    log = Net::HTTP.get(URI.parse(url))
    log.force_encoding(Encoding::CP51932).encode!('UTF-8', invalid: :replace, undef: :replace)
    log.lines do |line|
        if m = line.match(%r|(\d+/\d+/\d+\(.\)) (\d+:\d+:\d+)|)
            id = Time.parse("#{m[1]} #{m[2]}").hour
            count[id] = (count[id] || 0) + 1
        end
    end
end

count.each_with_index do |*a|
    puts a.reverse.join(?,)
end
