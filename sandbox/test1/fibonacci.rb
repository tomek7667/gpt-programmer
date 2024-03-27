def fib(n)
	m = [0, 1]
	(n-1).times do |i|
	m << m[-1] + m[-2]
	m.pop
	m << m[-1]

end
puts *m[0..n]