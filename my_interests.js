var categories = {
	"Arts": {"weight": 11, "children": {
		"Movies" : {"weight": 5},
		"Music": {"weight": 2},
		"Dance": {"weight": 4}
	}},
	"Computers": {"weight": 244, children: {
		"Algorithms": {"weight": 34},
		"Artificial Intelligence": {"weight": 200, "children": {
			"Fuzzy": {"weight": 8},
			"Machine Learning": {"weight": 100},
			"Natural Language": {"weight": 12},
			"Neural Networks": {"weight": 80}
		}},
		"Operating Systems": {"weight": 10}
	}},
	"News": {"weight": 34, "children": {
		"Television": {"weight": 4},
		"Radio": {"weight": 10},
		"Weather": {"weight": 20}
	}}
}