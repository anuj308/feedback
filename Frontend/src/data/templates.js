// Template definitions with predefined questions and structure
export const formTemplates = [
  {
    id: 'contact-us',
    title: 'Contact Us',
    description: 'Collect contact information and inquiries from visitors',
    category: 'business',
    icon: '📞',
    color: 'bg-blue-500',
    questions: [
      {
        questionId: 'q_1',
        type: 'shortAnswer',
        question: 'What is your full name?',
        description: '',
        required: true,
        titlePlaceholder: 'Enter your full name',
        options: []
      },
      {
        questionId: 'q_2',
        type: 'shortAnswer',
        question: 'What is your email address?',
        description: '',
        required: true,
        titlePlaceholder: 'Enter your email address',
        options: []
      },
      {
        questionId: 'q_3',
        type: 'shortAnswer',
        question: 'What is your phone number?',
        description: '',
        required: false,
        titlePlaceholder: 'Enter your phone number',
        options: []
      },
      {
        questionId: 'q_4',
        type: 'paragraph',
        question: 'How can we help you?',
        description: '',
        required: true,
        titlePlaceholder: 'Describe your inquiry or message',
        options: []
      }
    ]
  },
  {
    id: 'customer-feedback',
    title: 'Customer Feedback',
    description: 'Gather valuable feedback from your customers',
    category: 'feedback',
    icon: '⭐',
    color: 'bg-yellow-500',
    questions: [
      {
        questionId: 'q_1',
        type: 'shortAnswer',
        question: 'What is your name?',
        description: 'Optional',
        required: false,
        titlePlaceholder: 'Enter your name (optional)',
        options: []
      },
      {
        questionId: 'q_2',
        type: 'multipleChoice',
        question: 'How would you rate our service?',
        description: '',
        required: true,
        titlePlaceholder: '',
        options: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']
      },
      {
        questionId: 'q_3',
        type: 'checkbox',
        question: 'What aspects did you like most? (Select all that apply)',
        description: '',
        required: false,
        titlePlaceholder: '',
        options: ['Quality', 'Speed', 'Customer Service', 'Pricing', 'User Experience']
      },
      {
        questionId: 'q_4',
        type: 'paragraph',
        question: 'Any additional comments or suggestions?',
        description: '',
        required: false,
        titlePlaceholder: 'Share your thoughts with us',
        options: []
      }
    ]
  },
  {
    id: 'job-application',
    title: 'Job Application',
    description: 'Streamline your hiring process with this application form',
    category: 'hr',
    icon: '💼',
    color: 'bg-green-500',
    questions: [
      {
        questionId: 'q_1',
        type: 'shortAnswer',
        question: 'What is your full name?',
        description: '',
        required: true,
        titlePlaceholder: 'Enter your full name',
        options: []
      },
      {
        questionId: 'q_2',
        type: 'shortAnswer',
        question: 'What is your email address?',
        description: '',
        required: true,
        titlePlaceholder: 'Enter your email address',
        options: []
      },
      {
        questionId: 'q_3',
        type: 'shortAnswer',
        question: 'What position are you applying for?',
        description: '',
        required: true,
        titlePlaceholder: 'Enter the position title',
        options: []
      },
      {
        questionId: 'q_4',
        type: 'multipleChoice',
        question: 'What is your experience level?',
        description: '',
        required: true,
        titlePlaceholder: '',
        options: ['Entry Level', '1-3 years', '3-5 years', '5-10 years', '10+ years']
      },
      {
        questionId: 'q_5',
        type: 'paragraph',
        question: 'Why do you want to work with us?',
        description: '',
        required: true,
        titlePlaceholder: 'Tell us about your motivation',
        options: []
      }
    ]
  },
  {
    id: 'event-registration',
    title: 'Event Registration',
    description: 'Manage event registrations efficiently',
    category: 'events',
    icon: '🎟️',
    color: 'bg-purple-500',
    questions: [
      {
        questionId: 'q_1',
        type: 'shortAnswer',
        question: 'What is your full name?',
        description: '',
        required: true,
        titlePlaceholder: 'Enter your full name',
        options: []
      },
      {
        questionId: 'q_2',
        type: 'shortAnswer',
        question: 'What is your email address?',
        description: '',
        required: true,
        titlePlaceholder: 'Enter your email address',
        options: []
      },
      {
        questionId: 'q_3',
        type: 'multipleChoice',
        question: 'Which ticket type would you like?',
        description: '',
        required: true,
        titlePlaceholder: '',
        options: ['General Admission', 'VIP', 'Student Discount', 'Group Package']
      },
      {
        questionId: 'q_4',
        type: 'checkbox',
        question: 'Dietary restrictions (if any)',
        description: '',
        required: false,
        titlePlaceholder: '',
        options: ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'No restrictions']
      },
      {
        questionId: 'q_5',
        type: 'paragraph',
        question: 'Any special requirements or comments?',
        description: '',
        required: false,
        titlePlaceholder: 'Let us know if you have any special needs',
        options: []
      }
    ]
  },
  {
    id: 'product-survey',
    title: 'Product Survey',
    description: 'Understand your customers\' product preferences',
    category: 'research',
    icon: '📊',
    color: 'bg-indigo-500',
    questions: [
      {
        questionId: 'q_1',
        type: 'multipleChoice',
        question: 'How often do you use our product?',
        description: '',
        required: true,
        titlePlaceholder: '',
        options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'First time']
      },
      {
        questionId: 'q_2',
        type: 'multipleChoice',
        question: 'How satisfied are you with the product?',
        description: '',
        required: true,
        titlePlaceholder: '',
        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
      },
      {
        questionId: 'q_3',
        type: 'checkbox',
        question: 'Which features do you use most? (Select all that apply)',
        description: '',
        required: false,
        titlePlaceholder: '',
        options: ['Feature A', 'Feature B', 'Feature C', 'Feature D', 'Feature E']
      },
      {
        questionId: 'q_4',
        type: 'paragraph',
        question: 'What improvements would you suggest?',
        description: '',
        required: false,
        titlePlaceholder: 'Share your ideas for product improvement',
        options: []
      }
    ]
  },
  {
    id: 'newsletter-signup',
    title: 'Newsletter Signup',
    description: 'Build your email list with this simple signup form',
    category: 'marketing',
    icon: '📧',
    color: 'bg-red-500',
    questions: [
      {
        questionId: 'q_1',
        type: 'shortAnswer',
        question: 'What is your first name?',
        description: '',
        required: true,
        titlePlaceholder: 'Enter your first name',
        options: []
      },
      {
        questionId: 'q_2',
        type: 'shortAnswer',
        question: 'What is your email address?',
        description: '',
        required: true,
        titlePlaceholder: 'Enter your email address',
        options: []
      },
      {
        questionId: 'q_3',
        type: 'checkbox',
        question: 'What topics interest you? (Select all that apply)',
        description: '',
        required: false,
        titlePlaceholder: '',
        options: ['Technology', 'Business', 'Health', 'Travel', 'Food', 'Sports']
      }
    ]
  }
];

export const templateCategories = [
  { id: 'all', name: 'All Templates', icon: '📝' },
  { id: 'business', name: 'Business', icon: '🏢' },
  { id: 'feedback', name: 'Feedback', icon: '💬' },
  { id: 'hr', name: 'HR & Recruitment', icon: '👥' },
  { id: 'events', name: 'Events', icon: '🎉' },
  { id: 'research', name: 'Research', icon: '🔬' },
  { id: 'marketing', name: 'Marketing', icon: '📈' }
];
