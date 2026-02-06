<?php

namespace App\Jobs;

use App\Models\File;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProcessFileOcr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     * We increase this because PDF/OCR processing can be slow.
     *
     * @var int
     */
    public $timeout = 300; 

    /**
     * Create a new job instance.
     */
    public function __construct(public File $file)
    {
        //
    }


    public function handle(): void
    {

        if (!Storage::exists($this->file->path)) {
            Log::error("OCR Job: File record exists but physical file is missing: {$this->file->path}");
            return;
        }

        $fullPath = Storage::path($this->file->path);

        try {

            $response = Http::attach(
                'file', 
                file_get_contents($fullPath), 
                $this->file->name
            )
            ->timeout(120) // HTTP timeout (2 minutes)
            ->post('http://ocr:8000/ocr');

            // 3. Handle the response
            if ($response->successful()) {
                $text = $response->json('text');

                // Update the database with the extracted text
                $this->file->update([
                    'ocr_text' => $text
                ]);

                Log::info("OCR Success for File ID {$this->file->id}");
            } else {
                Log::error("OCR Service Failed for File ID {$this->file->id}: " . $response->body());
            }

        } catch (\Exception $e) {
            Log::error("OCR Job Exception for File ID {$this->file->id}: " . $e->getMessage());
            // Optional: $this->fail($e);
        }
    }
}