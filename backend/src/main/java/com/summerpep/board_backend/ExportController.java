package com.summerpep.board_backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/exports")
@CrossOrigin(origins = "*")
public class ExportController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/user/{username}")
    public ResponseEntity<String> uploadFile(@PathVariable String username, @RequestParam("file") MultipartFile file) {
        String filename = fileStorageService.saveFile(file, username);
        return ResponseEntity.ok("File uploaded successfully: " + filename);
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<String>> listFiles(@PathVariable String username) {
        List<String> files = fileStorageService.loadAllForUser(username);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/user/{username}/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(@PathVariable String username, @PathVariable String filename) {
        Resource file = fileStorageService.loadFileAsResource(username, filename);
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + file.getFilename() + "\"").body(file);
    }
}
