import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Download, CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const DataCleaningApp = () => {
  const [records, setRecords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editedInput, setEditedInput] = useState('');
  const [editedOutput, setEditedOutput] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const parsedRecords = lines.map(line => {
      try {
        const record = JSON.parse(line);
        return {
          ...record,
          approve: record.approve !== undefined ? record.approve : null
        };
      } catch (e) {
        return null;
      }
    }).filter(record => record !== null);

    await setRecords(parsedRecords);
    const progress = parsedRecords.reduce((acc, record) => {
      if(record.approve !== null) acc++;
      return acc;
    }, 0);
    console.log(progress)
    setCurrentIndex(progress-1);
    if (parsedRecords[progress-1]) {
      setEditedInput(parsedRecords[progress-1].input);
      setEditedOutput(parsedRecords[progress-1].output || '');
    }
  };

  const handleApprove = () => {
    const updatedRecords = [...records];
    updatedRecords[currentIndex] = {
      ...updatedRecords[currentIndex],
      input: editedInput,
      output: editedOutput,
      approve: true
    };
    setRecords(updatedRecords);
    moveToNext();
  };

  const handleReject = () => {
    const updatedRecords = [...records];
    updatedRecords[currentIndex] = {
      ...updatedRecords[currentIndex],
      input: editedInput,
      output: editedOutput,
      approve: false
    };
    setRecords(updatedRecords);
    moveToNext();
  };

  const moveToNext = () => {
    if (currentIndex < records.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setEditedInput(records[currentIndex + 1].input);
      setEditedOutput(records[currentIndex + 1]?.output || '');
    }
  };

  const moveToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setEditedInput(records[currentIndex - 1].input);
      setEditedOutput(records[currentIndex - 1]?.output || '');
    }
  };

  const handleDownload = () => {
    const content = records.map(record => JSON.stringify(record)).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned_data.jsonl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentRecord = records[currentIndex];
  const isComplete = currentIndex >= records.length;
  
  const progressStats = records.reduce((acc, record) => {
    if (record.approve === true) acc.approved++;
    else if (record.approve === false) acc.rejected++;
    else acc.pending++;
    return acc;
  }, { approved: 0, rejected: 0, pending: 0 });

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".jsonl"
          className="hidden"
        />
        <Button 
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
        >
          JSONLファイルをアップロード
        </Button>
        {records.length > 0 && (
          <Button 
            onClick={handleDownload}
            variant="outline"
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            途中経過をダウンロード
          </Button>
        )}
      </div>

      {records.length > 0 && !isComplete && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {currentIndex + 1} / {records.length}
              </span>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>承認済: {progressStats.approved}</span>
                <span>却下済: {progressStats.rejected}</span>
                <span>未処理: {progressStats.pending}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-medium">入力:</label>
              <Textarea
                value={editedInput}
                onChange={(e) => setEditedInput(e.target.value)}
                rows={4}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium">出力:</label>
              <Textarea
                value={editedOutput}
                onChange={(e) => setEditedOutput(e.target.value)}
                rows={6}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <Button
                onClick={moveToPrevious}
                variant="outline"
                disabled={currentIndex === 0}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                前へ
              </Button>

              <div className="flex space-x-2">
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  className="flex items-center"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  却下
                </Button>
                <Button
                  onClick={handleApprove}
                  variant="default"
                  className="flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  承認
                </Button>
              </div>
            </div>

            {currentRecord.approve !== null && (
              <div className={`text-center p-2 rounded ${
                currentRecord.approve ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                このレコードは{currentRecord.approve ? '承認' : '却下'}済みです
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isComplete && records.length > 0 && (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-green-500" />
            <h3 className="text-xl font-medium">確認完了</h3>
            <div className="space-y-2">
              <p>全てのレコードの確認が完了しました。</p>
              <div className="flex justify-center gap-4 text-sm">
                <span>承認済: {progressStats.approved}</span>
                <span>却下済: {progressStats.rejected}</span>
                <span>未処理: {progressStats.pending}</span>
              </div>
            </div>
            <Button 
              onClick={handleDownload}
              className="flex items-center mx-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              データをダウンロード
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataCleaningApp;
