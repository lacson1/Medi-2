#!/bin/bash

echo "🚀 Starting development server with auto error monitoring..."

# Start the auto error fix script in background
./auto-error-fix.sh monitor &
AUTO_FIX_PID=$!

# Start the development server
npm run dev &
DEV_PID=$!

echo "📊 Development server PID: $DEV_PID"
echo "🔧 Auto error fix PID: $AUTO_FIX_PID"
echo ""
echo "🌐 Your app is running at: http://localhost:3000"
echo "📊 Error monitor is available at: http://localhost:3000/error-monitor.html"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $DEV_PID 2>/dev/null
    kill $AUTO_FIX_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for either process to exit
wait
