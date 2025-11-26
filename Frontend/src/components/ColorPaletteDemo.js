import React, { useState } from 'react';
import './ColorPaletteDemo.css';

const ColorPaletteDemo = () => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="color-palette-demo">
      <div className="demo-header">
        <h1 className="demo-title">BookStore Color Palette & Design System</h1>
        <button className="btn btn-secondary" onClick={toggleTheme}>
          Toggle {theme === 'light' ? 'Dark' : 'Light'} Theme
        </button>
      </div>

      {/* Color Palette Section */}
      <section className="demo-section">
        <h2 className="section-title">🎨 Color Palette</h2>
        
        <div className="color-grid">
          <div className="color-group">
            <h3>Primary Colors</h3>
            <div className="color-swatches">
              <div className="color-swatch bg-primary-50">50</div>
              <div className="color-swatch bg-primary-100">100</div>
              <div className="color-swatch bg-primary-200">200</div>
              <div className="color-swatch bg-primary-300">300</div>
              <div className="color-swatch bg-primary-400">400</div>
              <div className="color-swatch bg-primary-500 text-inverse">500</div>
              <div className="color-swatch bg-primary-600 text-inverse">600</div>
              <div className="color-swatch bg-primary-700 text-inverse">700</div>
              <div className="color-swatch bg-primary-800 text-inverse">800</div>
              <div className="color-swatch bg-primary-900 text-inverse">900</div>
            </div>
          </div>

          <div className="color-group">
            <h3>Secondary Colors</h3>
            <div className="color-swatches">
              <div className="color-swatch bg-secondary-50">50</div>
              <div className="color-swatch bg-secondary-100">100</div>
              <div className="color-swatch bg-secondary-200">200</div>
              <div className="color-swatch bg-secondary-300">300</div>
              <div className="color-swatch bg-secondary-400">400</div>
              <div className="color-swatch bg-secondary-500 text-inverse">500</div>
              <div className="color-swatch bg-secondary-600 text-inverse">600</div>
              <div className="color-swatch bg-secondary-700 text-inverse">700</div>
              <div className="color-swatch bg-secondary-800 text-inverse">800</div>
              <div className="color-swatch bg-secondary-900 text-inverse">900</div>
            </div>
          </div>

          <div className="color-group">
            <h3>Semantic Colors</h3>
            <div className="color-swatches">
              <div className="color-swatch bg-success text-inverse">Success</div>
              <div className="color-swatch bg-warning text-inverse">Warning</div>
              <div className="color-swatch bg-error text-inverse">Error</div>
              <div className="color-swatch bg-info text-inverse">Info</div>
            </div>
          </div>
        </div>
      </section>

      {/* Component Examples Section */}
      <section className="demo-section">
        <h2 className="section-title">🧩 Component Examples</h2>
        
        <div className="component-grid">
          {/* Buttons */}
          <div className="component-group">
            <h3>Buttons</h3>
            <div className="button-examples">
              <button className="btn btn-primary">Primary</button>
              <button className="btn btn-secondary">Secondary</button>
              <button className="btn btn-outline">Outline</button>
              <button className="btn btn-ghost">Ghost</button>
              <button className="btn btn-success">Success</button>
              <button className="btn btn-warning">Warning</button>
              <button className="btn btn-error">Error</button>
            </div>
            <div className="button-sizes">
              <button className="btn btn-primary btn-sm">Small</button>
              <button className="btn btn-primary">Default</button>
              <button className="btn btn-primary btn-lg">Large</button>
            </div>
          </div>

          {/* Cards */}
          <div className="component-group">
            <h3>Cards</h3>
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Sample Card</h4>
                <p className="card-subtitle">This is a subtitle</p>
              </div>
              <div className="card-body">
                <p>This is a sample card component using the design system.</p>
              </div>
              <div className="card-footer">
                <button className="btn btn-primary btn-sm">Action</button>
              </div>
            </div>
          </div>

          {/* Forms */}
          <div className="component-group">
            <h3>Forms</h3>
            <div className="form-examples">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="Enter your email" />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-input form-textarea" placeholder="Enter your message"></textarea>
              </div>
              <button className="btn btn-primary">Submit</button>
            </div>
          </div>

          {/* Alerts */}
          <div className="component-group">
            <h3>Alerts</h3>
            <div className="alert-examples">
              <div className="alert alert-success">
                <div className="alert-title">Success!</div>
                <div className="alert-message">Your action was completed successfully.</div>
              </div>
              <div className="alert alert-warning">
                <div className="alert-title">Warning!</div>
                <div className="alert-message">Please review your input before proceeding.</div>
              </div>
              <div className="alert alert-error">
                <div className="alert-title">Error!</div>
                <div className="alert-message">Something went wrong. Please try again.</div>
              </div>
              <div className="alert alert-info">
                <div className="alert-title">Info</div>
                <div className="alert-message">Here's some helpful information.</div>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="component-group">
            <h3>Badges</h3>
            <div className="badge-examples">
              <span className="badge badge-primary">Primary</span>
              <span className="badge badge-secondary">Secondary</span>
              <span className="badge badge-success">Success</span>
              <span className="badge badge-warning">Warning</span>
              <span className="badge badge-error">Error</span>
              <span className="badge badge-info">Info</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="component-group">
            <h3>Navigation</h3>
            <nav className="nav-example">
              <a href="#" className="nav-item active">Home</a>
              <a href="#" className="nav-item">Books</a>
              <a href="#" className="nav-item">Cart</a>
              <a href="#" className="nav-item">Account</a>
            </nav>
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section className="demo-section">
        <h2 className="section-title">📝 Typography</h2>
        
        <div className="typography-examples">
          <h1 className="text-4xl">Heading 1 - Large Title</h1>
          <h2 className="text-3xl">Heading 2 - Section Title</h2>
          <h3 className="text-2xl">Heading 3 - Subsection</h3>
          <h4 className="text-xl">Heading 4 - Card Title</h4>
          <h5 className="text-lg">Heading 5 - Small Title</h5>
          <h6 className="text-base">Heading 6 - Tiny Title</h6>
          
          <p className="text-base">This is a regular paragraph with normal text size and line height for comfortable reading.</p>
          <p className="text-sm text-secondary">This is smaller text, typically used for captions, metadata, or secondary information.</p>
          
          <div className="font-examples">
            <p className="font-thin">Thin font weight (100)</p>
            <p className="font-light">Light font weight (300)</p>
            <p className="font-normal">Normal font weight (400)</p>
            <p className="font-medium">Medium font weight (500)</p>
            <p className="font-semibold">Semibold font weight (600)</p>
            <p className="font-bold">Bold font weight (700)</p>
            <p className="font-extrabold">Extrabold font weight (800)</p>
          </div>
        </div>
      </section>

      {/* Spacing Section */}
      <section className="demo-section">
        <h2 className="section-title">📐 Spacing & Layout</h2>
        
        <div className="spacing-examples">
          <div className="spacing-demo">
            <h3>Spacing Scale</h3>
            <div className="spacing-items">
              <div className="spacing-item m-1">m-1 (4px)</div>
              <div className="spacing-item m-2">m-2 (8px)</div>
              <div className="spacing-item m-4">m-4 (16px)</div>
              <div className="spacing-item m-6">m-6 (24px)</div>
              <div className="spacing-item m-8">m-8 (32px)</div>
            </div>
          </div>

          <div className="layout-demo">
            <h3>Layout Utilities</h3>
            <div className="flex gap-4 p-4 bg-secondary rounded-lg">
              <div className="p-4 bg-primary text-inverse rounded">Flex Item 1</div>
              <div className="p-4 bg-primary text-inverse rounded">Flex Item 2</div>
              <div className="p-4 bg-primary text-inverse rounded">Flex Item 3</div>
            </div>
          </div>
        </div>
      </section>

      {/* Gradients Section */}
      <section className="demo-section">
        <h2 className="section-title">🎨 Gradients</h2>
        
        <div className="gradient-examples">
          <div className="gradient-item gradient-primary">
            <h3>Primary Gradient</h3>
            <p>Blue gradient for primary elements</p>
          </div>
          <div className="gradient-item gradient-secondary">
            <h3>Secondary Gradient</h3>
            <p>Pink gradient for secondary elements</p>
          </div>
          <div className="gradient-item gradient-hero">
            <h3>Hero Gradient</h3>
            <p>Blue to pink gradient for hero sections</p>
          </div>
          <div className="gradient-item gradient-card">
            <h3>Card Gradient</h3>
            <p>Subtle gradient for card backgrounds</p>
          </div>
        </div>
      </section>

      {/* Utility Classes Section */}
      <section className="demo-section">
        <h2 className="section-title">🔧 Utility Classes</h2>
        
        <div className="utility-examples">
          <div className="utility-group">
            <h3>Background Colors</h3>
            <div className="utility-grid">
              <div className="utility-item bg-primary text-inverse">bg-primary</div>
              <div className="utility-item bg-secondary text-inverse">bg-secondary</div>
              <div className="utility-item bg-success text-inverse">bg-success</div>
              <div className="utility-item bg-warning text-inverse">bg-warning</div>
              <div className="utility-item bg-error text-inverse">bg-error</div>
              <div className="utility-item bg-info text-inverse">bg-info</div>
            </div>
          </div>

          <div className="utility-group">
            <h3>Text Colors</h3>
            <div className="utility-grid">
              <div className="utility-item text-primary">text-primary</div>
              <div className="utility-item text-secondary">text-secondary</div>
              <div className="utility-item text-success">text-success</div>
              <div className="utility-item text-warning">text-warning</div>
              <div className="utility-item text-error">text-error</div>
              <div className="utility-item text-info">text-info</div>
            </div>
          </div>

          <div className="utility-group">
            <h3>Border Colors</h3>
            <div className="utility-grid">
              <div className="utility-item border-light">border-light</div>
              <div className="utility-item border-medium">border-medium</div>
              <div className="utility-item border-dark">border-dark</div>
              <div className="utility-item border-brand">border-brand</div>
              <div className="utility-item border-success">border-success</div>
              <div className="utility-item border-error">border-error</div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Section */}
      <section className="demo-section">
        <h2 className="section-title">♿ Accessibility Features</h2>
        
        <div className="accessibility-examples">
          <div className="accessibility-group">
            <h3>Focus Indicators</h3>
            <p>All interactive elements have visible focus indicators:</p>
            <button className="btn btn-primary focus-brand">Focusable Button</button>
            <input type="text" className="form-input focus-brand" placeholder="Focusable Input" />
          </div>

          <div className="accessibility-group">
            <h3>High Contrast Support</h3>
            <p>The color system automatically adjusts for high contrast mode preferences.</p>
            <div className="contrast-demo">
              <div className="contrast-item bg-primary text-inverse">High Contrast Text</div>
              <div className="contrast-item bg-secondary text-inverse">High Contrast Text</div>
            </div>
          </div>

          <div className="accessibility-group">
            <h3>Reduced Motion</h3>
            <p>Animations respect the user's motion preferences.</p>
            <div className="motion-demo">
              <div className="spinner"></div>
              <p>Spinner respects reduced motion preferences</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ColorPaletteDemo;
