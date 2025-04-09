# Adversarial Attacks Explorer

An interactive web application to demonstrate and explain adversarial attacks on neural networks. This application provides a platform to explore how adversarial examples can fool deep learning models and how different defense strategies can mitigate these vulnerabilities.

## Features

- **Interactive Adversarial Attack Generation**: Upload images and generate adversarial examples using state-of-the-art attack methods (FGSM, PGD, DeepFool, C&W).
- **Defense Strategy Comparison**: Explore different defense techniques including adversarial training, defensive distillation, and progressive training.
- **Comprehensive Visualizations**: View detailed visualizations of perturbations, feature maps, and model behavior.
- **Educational Content**: Learn about the theory behind adversarial attacks and defenses with mathematical explanations.

## System Requirements

- Python 3.8+
- Node.js 14+
- CUDA-compatible GPU (optional, for faster processing)

## Installation and Setup

### Option 1: Docker (Recommended)

The easiest way to run the application is using Docker:

1. Clone the repository:

   ```bash
    git clone https://github.com/yourusername/adversarial-attacks-explorer.git
    cd adversarial-attacks-explorer
   ```

2. Place the pre-trained model files in the `pretrained/` directory:
   - `best_standard_model.pth`
   - `best_adv_pgd_model.pth`
   - `best_distill_model.pth`
   - `best_progressive_pgd_model.pth`

3. Place sample images in the `static/samples/` directory:
   - `sample_1.jpg`
   - `sample_2.jpg`
   - `sample_3.jpg`

4. Build and run using Docker Compose:

   ```bash
   docker-compose up --build
   ```

5. Access the application at <http://localhost:5000>

### Option 2: Manual Setup

If you prefer to set up the application manually:

#### Backend Setup

1. Create a Python virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Place the pre-trained model files in the `backend/pretrained/` directory:
   - `best_standard_model.pth`
   - `best_adv_pgd_model.pth`
   - `best_distill_model.pth`
   - `best_progressive_pgd_model.pth`

4. Generate precomputed visualizations:

   ```bash
   python precompute_visualizations.py
   ```

#### Frontend Setup

1. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

#### Running the Application

1. Start the backend server:

   ```bash
   cd backend
   python app.py
   ```

2. In a separate terminal, start the frontend development server:

   ```bash
   cd frontend
   npm start
   ```

3. Access the application:
   - Frontend: <http://localhost:3000>
   - Backend API: <http://localhost:5000/api>

## Application Structure

```
adversarial-attacks-webapp/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── models/
│   │   ├── __init__.py
│   │   ├── attacks.py         # Adversarial attack implementations
│   │   └── defenses.py        # Defense strategy implementations
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── visualization.py   # Visualization utilities
│   │   └── image_utils.py     # Image processing utilities
│   ├── static/
│   │   ├── precomputed/       # Pre-generated visualizations
│   │   └── uploads/           # Temporary storage for uploaded images
│   ├── pretrained/            # Pretrained model files
│   ├── precompute_visualizations.py  # Script to generate visualizations
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── utils/             # Utility functions
│   │   ├── assets/            # Static assets
│   │   ├── App.js             # Main App component
│   │   └── index.js           # Entry point
│   ├── package.json           # Node.js dependencies
│   └── README.md              # Frontend documentation
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker Compose configuration
└── README.md                  # Project documentation
```

## Using the Application

### Generating Adversarial Examples

1. Navigate to the "Attacks" page
2. Upload an image or select a sample image
3. Choose an attack method (FGSM, PGD, DeepFool, C&W)
4. Adjust the epsilon parameter (perturbation strength)
5. Click "Generate Adversarial Example"
6. View the results, including the original and adversarial images, perturbation visualization, and model predictions

### Exploring Defense Strategies

1. Navigate to the "Defenses" page
2. Select a defense model (Standard Training, Adversarial Training, Defensive Distillation, Progressive Training)
3. Choose an attack method and epsilon value
4. Click "Evaluate Robustness"
5. View the results, including accuracy on clean and adversarial examples

### Comparing Models

1. Navigate to the "Leaderboard" page
2. View the comprehensive comparison of different defense strategies
3. Explore various metrics including clean accuracy, adversarial accuracy, and robustness ratio

## Model Details

The application uses four pre-trained ResNet-18 models trained on the CIFAR-10 dataset:

1. **Standard Training**: Baseline model trained using standard training procedure without any adversarial examples.
2. **Adversarial Training**: Model trained with adversarial examples generated using PGD attack during training.
3. **Defensive Distillation**: Model trained using knowledge distillation with soft labels and high temperature to smooth decision boundaries.
4. **Progressive Training**: Model trained with progressively stronger adversarial examples, gradually increasing attack strength.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [PyTorch](https://pytorch.org/) for the deep learning framework
- [Adversarial Robustness Toolbox (ART)](https://github.com/Trusted-AI/adversarial-robustness-toolbox) for adversarial attack implementations
- [React](https://reactjs.org/) and [Material-UI](https://mui.com/) for the frontend
- [Flask](https://flask.palletsprojects.com/) for the backend API
