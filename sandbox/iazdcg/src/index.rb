
require 'sinatra'

post '/api/v1/developer' do
  request.body.rewind
  data = JSON.parse(request.body.read)
  content = data['content']
  puts content
end
