import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div style={{ minHeight: '100vh', background: '#f4efe6', color: '#143528', padding: '48px 24px', fontFamily: 'Outfit, sans-serif' }}>
        <p style={{ letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 12, color: '#2f6b47' }}>The shopfront</p>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem' }}>Something snagged on the rack.</h1>
        <p style={{ marginTop: 12, maxWidth: '40ch' }}>Refresh the page. The aisles are still here.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            marginTop: 20,
            height: 48,
            padding: '0 22px',
            borderRadius: 999,
            border: 0,
            background: '#143528',
            color: '#f4efe6',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </div>
    )
  }
}
