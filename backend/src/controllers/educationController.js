const educationController = {
    // Sample educational topics and content
    topics: [
        {
            id: 1,
            title: 'Investment Basics',
            description: 'Learn the fundamentals of investing',
            categories: ['stocks', 'bonds', 'mutual funds'],
            difficulty: 'beginner'
        },
        {
            id: 2,
            title: 'Advanced Trading Strategies',
            description: 'Master complex trading techniques',
            categories: ['technical analysis', 'derivatives', 'options'],
            difficulty: 'advanced'
        },
        {
            id: 3,
            title: 'Personal Finance Management',
            description: 'Essential skills for managing personal finances',
            categories: ['budgeting', 'saving', 'credit'],
            difficulty: 'beginner'
        }
    ],

    articles: {
        1: {
            title: 'Understanding Stock Markets',
            content: 'A comprehensive guide to stock market basics...',
            author: 'Financial Expert',
            readTime: '10 minutes',
            topics: ['stocks', 'investing']
        },
        2: {
            title: 'Bond Investment Strategies',
            content: 'Learn about different types of bonds and investment strategies...',
            author: 'Bond Market Specialist',
            readTime: '15 minutes',
            topics: ['bonds', 'fixed income']
        }
    },

    courses: [
        {
            id: 1,
            title: 'Investment 101',
            description: 'Start your investment journey',
            duration: '4 weeks',
            modules: ['Basics of Investing', 'Risk Management', 'Portfolio Building'],
            level: 'beginner'
        },
        {
            id: 2,
            title: 'Technical Analysis Masterclass',
            description: 'Advanced chart reading and technical indicators',
            duration: '6 weeks',
            modules: ['Chart Patterns', 'Technical Indicators', 'Trading Strategies'],
            level: 'advanced'
        }
    ],

    getTopics(req, res) {
        try {
            const { difficulty, category } = req.query;
            let filteredTopics = [...this.topics];

            if (difficulty) {
                filteredTopics = filteredTopics.filter(topic => topic.difficulty === difficulty);
            }

            if (category) {
                filteredTopics = filteredTopics.filter(topic =>
                    topic.categories.includes(category.toLowerCase())
                );
            }

            res.json(filteredTopics);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch topics' });
        }
    },

    getArticle(req, res) {
        try {
            const { id } = req.params;
            const article = this.articles[id];

            if (!article) {
                return res.status(404).json({ error: 'Article not found' });
            }

            res.json(article);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch article' });
        }
    },

    getCourses(req, res) {
        try {
            const { level } = req.query;
            let filteredCourses = [...this.courses];

            if (level) {
                filteredCourses = filteredCourses.filter(course => course.level === level);
            }

            res.json(filteredCourses);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch courses' });
        }
    }
};

export default educationController;