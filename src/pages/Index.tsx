
import React, { useState } from 'react';
import { Upload, AlertCircle, FileCode, Sun, Moon, FileText, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ScanResult {
  type: 'vulnerability' | 'sensitive';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  message: string;
  line: number;
  code: string;
  description: string;
}

const sensitivePatterns = {
  apiKey: /(?:api[_-]?key|api[_-]?token)[\":'\s]*([a-zA-Z0-9_\-]{20,})|\b(?:sk|pk)_(?:test|live)_[0-9a-zA-Z]{24,}/i,
  awsKey: /(?:AKIA|A3T|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/i,
  privateKey: /-----BEGIN[A-Z\s]+PRIVATE KEY-----/,
  password: /(?:password|passwd|pwd)[\":'\s]*([a-zA-Z0-9_\-@#$%^&*]{8,})/i,
  jwt: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/i,
};

const vulnerabilityPatterns = {
  xss: /document\.write\(|\.innerHTML\s*=(?!\s*''\s*)/i,
  eval: /eval\(|new Function\(|setTimeout\(['"]/i,
  sqlInjection: /executeQuery\(|SELECT.+FROM.+WHERE/i,
  unsafeRegex: /\.match\(.*\/.*\/[gimuy]*\)/i,
  commandInjection: /exec\(|spawn\(|child_process/i,
};

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [codeInput, setCodeInput] = useState('');
  const { toast } = useToast();

  const scanCode = (code: string) => {
    const newResults: ScanResult[] = [];
    const lines = code.split('\n');

    // Scan for vulnerabilities
    lines.forEach((line, index) => {
      Object.entries(vulnerabilityPatterns).forEach(([key, pattern]) => {
        if (pattern.test(line)) {
          newResults.push({
            type: 'vulnerability',
            severity: key === 'xss' || key === 'eval' ? 'critical' : 'high',
            message: `Potential ${key.toUpperCase()} vulnerability detected`,
            line: index + 1,
            code: line.trim(),
            description: getVulnerabilityDescription(key),
          });
        }
      });

      // Scan for sensitive information
      Object.entries(sensitivePatterns).forEach(([key, pattern]) => {
        if (pattern.test(line)) {
          newResults.push({
            type: 'sensitive',
            severity: 'critical',
            message: `Possible ${key} exposure detected`,
            line: index + 1,
            code: line.trim(),
            description: `Found potential ${key} in the code. This should never be hardcoded or committed to version control.`,
          });
        }
      });
    });

    return newResults;
  };

  const getVulnerabilityDescription = (type: string) => {
    const descriptions: { [key: string]: string } = {
      xss: "Cross-Site Scripting vulnerability could allow attackers to inject malicious scripts.",
      eval: "Using eval() can execute arbitrary JavaScript code and is generally unsafe.",
      sqlInjection: "Potential SQL injection point detected. Use parameterized queries instead.",
      unsafeRegex: "Dynamic regular expressions can lead to Regular Expression Denial of Service (ReDoS).",
      commandInjection: "Command injection vulnerability could allow arbitrary command execution.",
    };
    return descriptions[type] || "Security vulnerability detected";
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.js') && !file.name.endsWith('.txt')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JavaScript (.js) or text (.txt) file",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    const text = await file.text();
    const results = scanCode(text);
    setResults(results);
    setIsScanning(false);
    
    toast({
      title: "Scan Complete",
      description: `Found ${results.length} potential issues`,
    });
  };

  const handleCodeScan = () => {
    if (!codeInput.trim()) {
      toast({
        title: "No Code Provided",
        description: "Please enter some code to scan",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    const results = scanCode(codeInput);
    setResults(results);
    setIsScanning(false);

    toast({
      title: "Scan Complete",
      description: `Found ${results.length} potential issues`,
    });
  };

  const getStatistics = () => {
    const vulns = results.filter(r => r.type === 'vulnerability');
    const sensitive = results.filter(r => r.type === 'sensitive');
    return {
      total: results.length,
      vulnerabilities: vulns.length,
      sensitive: sensitive.length,
      critical: results.filter(r => r.severity === 'critical').length,
      high: results.filter(r => r.severity === 'high').length,
      medium: results.filter(r => r.severity === 'medium').length,
      low: results.filter(r => r.severity === 'low').length,
    };
  };

  return (
    <div className={`min-h-screen bg-background text-foreground`}>
      {/* Header */}
      <header className="glass border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
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
        {/* Left Panel - Upload & Input */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-lg">
            <Tabs defaultValue="upload">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="upload" className="w-full">Upload File</TabsTrigger>
                <TabsTrigger value="input" className="w-full">Input Code</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept=".js,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-12 h-12 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Drop your JavaScript or text file here
                      </span>
                    </label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="input">
                <div className="space-y-4">
                  <Textarea
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="Paste your code here..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <Button
                    className="w-full"
                    onClick={handleCodeScan}
                    disabled={isScanning}
                  >
                    {isScanning ? 'Scanning...' : 'Scan Code'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
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
                  className="space-y-6"
                >
                  {/* Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {Object.entries(getStatistics()).map(([key, value]) => (
                      <div key={key} className="glass p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-primary">{value}</div>
                        <div className="text-sm text-muted-foreground capitalize">{key}</div>
                      </div>
                    ))}
                  </div>

                  {/* Detailed Results */}
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <Alert
                        key={index}
                        className={`animate-slide-up severity-${result.severity}`}
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="flex items-center gap-2">
                          {result.type === 'vulnerability' ? (
                            <FileCode className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                          {result.type.toUpperCase()} - {result.severity.toUpperCase()} (Line {result.line})
                        </AlertTitle>
                        <AlertDescription>
                          <p className="mt-1">{result.message}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{result.description}</p>
                          <pre className="mt-2 p-2 bg-background/50 rounded text-sm overflow-x-auto">
                            {result.code}
                          </pre>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No issues detected yet. Upload a file or paste code to start scanning.
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
