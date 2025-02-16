
import React, { useState } from 'react';
import { Upload, AlertCircle, FileCode, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface ScanResult {
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  line: number;
  code: string;
}

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.js')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JavaScript (.js) file",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setResults([
        {
          severity: 'critical',
          message: 'Potential XSS vulnerability detected',
          line: 15,
          code: 'document.write(userInput)',
        },
        {
          severity: 'high',
          message: 'Insecure eval() usage found',
          line: 23,
          code: 'eval(data)',
        },
      ]);
      setIsScanning(false);
      toast({
        title: "Scan Complete",
        description: "Found 2 potential vulnerabilities",
      });
    }, 2000);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className="glass border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold">JSGuard</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="rounded-full"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Upload */}
        <div className="lg:col-span-1">
          <div className="glass p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Upload JavaScript File</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".js"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Drop your JavaScript file here or click to browse
                  </span>
                </label>
              </div>
              <Button
                className="w-full"
                disabled={isScanning}
              >
                {isScanning ? 'Scanning...' : 'Start Scan'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-2">
          <div className="glass p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Scan Results</h2>
            <AnimatePresence>
              {results.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {results.map((result, index) => (
                    <Alert
                      key={index}
                      variant={result.severity === 'critical' ? 'destructive' : 'default'}
                      className="animate-slide-up"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="flex items-center gap-2">
                        {result.severity.toUpperCase()} - Line {result.line}
                      </AlertTitle>
                      <AlertDescription>
                        <p className="mt-1">{result.message}</p>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
                          {result.code}
                        </pre>
                      </AlertDescription>
                    </Alert>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No vulnerabilities detected yet. Upload a file to start scanning.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
