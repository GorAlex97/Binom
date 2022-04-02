<?php

namespace APIEntities;

function error_handler($errno, $errstr) {
    if($errno == E_WARNING || $errno == E_NOTICE) throw new \Exception($errstr, $errno);
}

class LocalEditorController extends BaseController 
{

    private $directory;
    private $showHidden;
    private $rootDirectory;
    private $error;

    public function __construct($params)
    {
        $this->rootDirectory = dirname(__DIR__, 2) . '/landers';
        set_error_handler("APIEntities\\error_handler", E_ALL);
        $this->directory = isset($params['directory']) && strlen($params['directory']) > 0 ? $params['directory'] : $this->rootDirectory;
        $this->showHidden = isset($params['showHidden']) ? !!$params['showHidden'] : false;
        if(file_exists($this->directory)) {
            chdir($this->directory);
        } else {
            if(file_exists($this->rootDirectory)) {
                $this->directory = $this->rootDirectory;
                chdir($this->directory);
            }
            else {
                $this->directory = '/var/www';
                chdir($this->directory);
            }
        }
    }
    
    private function isDemo() {
        GLOBAL $Config;
        if(isset($Config->livedemo) && $Config->livedemo=='binom_demo_true') return true;
        return false;
    }
    public function __destruct() 
    {
        restore_error_handler();
    }

    public function checkInstalledExtensions($params) 
    {
        return json_encode(!!in_array($params['extension'], get_loaded_extensions()));
    }
    
    private function checkPermissions()
    {
        $userData = \GD::user()->getUserData();
        return !!$userData['allow_local_editing'];
    }

    private function response($res)
    {
        if($this->error) return json_encode(false);
        return json_encode($res);
    }

    private function isTrackerFile(string $name) 
    {
        if($this->isDemo()) return true;
        $trackerFiles = array(
            'admin',
            'api',
            'configuration',
            'core',
            'mail',
            'nlp',
            'opt-out',
            'templates',
            'userfiles',
            'arm.php',
            'click.php',
            'index.php',
            'favicon.ico'
        );
        if(strpos($name, dirname(__DIR__, 2)) !== false)
        {
           if($name === dirname(__DIR__,2) . '/landers') return true; 
           if(strpos($name, dirname(__DIR__,2) . '/landers') === false ) 
           {
                for($i = 0;$i<count($trackerFiles);$i++)
                {
                    if(strpos($name, dirname(__DIR__,2) . '/' . $trackerFiles[$i]) !== false) return true;
                }
                return false;
           }
        }
        return false;
    }

    private function getFormattedPermissions($perms) 
    {
        switch ($perms & 0xF000) {
            case 0xC000: // сокет
                $info = 's';
                break;
            case 0xA000: // символическая ссылка
                $info = 'l';
                break;
            case 0x8000: // обычный
                $info = '-';
                break;
            case 0x6000: // файл блочного устройства
                $info = 'b';
                break;
            case 0x4000: // каталог
                $info = 'd';
                break;
            case 0x2000: // файл символьного устройства
                $info = 'c';
                break;
            case 0x1000: // FIFO канал
                $info = 'p';
                break;
            default: // неизвестный
                $info = 'u';
        }

        // Владелец
        $info .= (($perms & 0x0100) ? 'r' : '-');
        $info .= (($perms & 0x0080) ? 'w' : '-');
        $info .= (($perms & 0x0040) ?
            (($perms & 0x0800) ? 's' : 'x' ) :
            (($perms & 0x0800) ? 'S' : '-'));

        // Группа
        $info .= (($perms & 0x0020) ? 'r' : '-');
        $info .= (($perms & 0x0010) ? 'w' : '-');
        $info .= (($perms & 0x0008) ?
            (($perms & 0x0400) ? 's' : 'x' ) :
            (($perms & 0x0400) ? 'S' : '-'));

        // Мир
        $info .= (($perms & 0x0004) ? 'r' : '-');
        $info .= (($perms & 0x0002) ? 'w' : '-');
        $info .= (($perms & 0x0001) ?
            (($perms & 0x0200) ? 't' : 'x' ) :
            (($perms & 0x0200) ? 'T' : '-'));

        return $info;
    }

    private function getFormattedFileType(string $file)
    {
        if(!is_dir($file))
        {
            $info = pathinfo($file);
            if($info && isset($info['extension'])  && $file[0] !== '.')
            {
                return 'File ' . mb_strtoupper($info['extension']);
            }
            else return 'File';
        }
        else return 'Folder';
    }

    private function getCurrentDirectoryFiles(string $directory)
    {
        $contents = scandir($directory);
        try {
            return $this->parseList($contents, $directory);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    private function parseList(array $list, string $fullPath) {
        if (is_array($list)) {
            $parsedItems = array();
            foreach($list as $file) {
                $fullPathToFile = $fullPath === '/' ?  $fullPath . $file : $fullPath . '/' . $file;
                $item = null;
                $item['name'] = $file;
                $item['size'] = is_dir($fullPathToFile) ? '' : round(filesize($fullPathToFile) / 1024, 2);
                $item['permissions'] = $this->getFormattedPermissions(fileperms($fullPathToFile));
                $item['type'] = $this->getFormattedFileType($file);
                $item['lastChanged'] = filemtime($fullPathToFile);
                $item['fullPath'] = $fullPathToFile;
                $item['path'] = $fullPath;
                $item['isEditable'] = !$this->isTrackerFile($fullPathToFile) && is_writable($fullPathToFile) && is_readable($fullPathToFile);
                $parsedItems[] = $item;
            }
            if($this->showHidden === false) {
                $parsedItems = array_filter($parsedItems, function ($item) {
                    if($item['name'][0] !== '.') return true;
                    return false;
                });
            }
            else {
                $parsedItems = array_filter($parsedItems, function( $item ) {
                    if($item['name'] === '.' || $item['name'] === '..') return false;
                    return true;
                });
            }
            usort($parsedItems, function($a, $b) {
                if ($a['type'] == $b['type']) {
                    return strcmp($a['name'], $b['name']);
                }
                return strcmp($b['type'], $a['type']);
            });
            return $parsedItems;
        }
        throw new \Exception('Unable to get file list');
    }

    private function copyRecursive($src_dir, $dst_dir)
    {
        if (is_dir($src_dir)) {
            mkdir($dst_dir);
            $files = scandir($src_dir);
            foreach ($files as $file)
                if ($file != "." && $file != "..") $this->copyRecursive("$src_dir/$file", "$dst_dir/$file");
        }
        else if (file_exists($src_dir)) copy($src_dir, $dst_dir);
    }

    private function deleteDirectoryRecursive($directory)
    {
        $files = array_diff(scandir($directory), array('.','..'));
        foreach ($files as $file) {
            (is_dir("$directory/$file")) ? $this->deleteDirectoryRecursive("$directory/$file") : unlink("$directory/$file");
        }
        return rmdir($directory);
    }

    public function getFilesList($params)
    {
        if($this->error) return $this->response(false);
        $directory = isset($params['directory']) && strlen($params['directory']) > 0 ? $params['directory'] : $this->directory;
        return $this->response($this->getCurrentDirectoryFiles($directory));
    }

    public function toParentDirectory($params)
    {
        if($this->error) return $this->response(false);
        chdir('..');
        $this->directory = dirname($this->directory);
        return $this->response($this->getCurrentDirectoryFiles($this->directory));
    }

    public function getFileContent($params) {
        try {
            if($this->error) return $this->response(false);
            $contents = file_get_contents($params['file']);
            return $this->response($contents);
        }
        catch(\Exception $exception)
        {
            return $this->response(false);
        }
    }

    public function createFile($params)
    {
        try {
            if($this->error) return $this->response(false);
            if($this->isTrackerFile($this->directory . '/' . $params['name'])) return json_encode(false);
            file_put_contents($params['name'], $params['content']);
            return $this->response($this->getCurrentDirectoryFiles($this->directory));
        }
        catch(\Exception $exception) {
            return $this->response(false);
        }
    }

    public function createDirectory($params)
    {
        try {
            if($this->error) return $this->response(false);
            if($this->isTrackerFile($this->directory . '/' . $params['name'])) return $this->response(false);
            mkdir($params['name']);
            return $this->response($this->getCurrentDirectoryFiles($this->directory));
        }
        catch(\Exception $exception) {
            return $this->response(false);
        }
    }

    public function isFileExists($params)
    {
        if($this->error) return $this->response(false);
        return $this->response(file_exists($params['fullPath']));
    }

    public function editFile($params)
    {
        try {
            if($this->error) return $this->response(false);
            if(isset($params['fromLanders']) && $params['fromLanders'] === true) {
                file_put_contents(dirname(__DIR__, 2) . '/' . $this->directory . '/' . $params['name'], $params['content']);
                return $this->response(true); 
            }
            else {
                if($this->isTrackerFile($this->directory . '/' . $params['name'])) return $this->response(false);
                file_put_contents($params['name'], $params['content']);
                return $this->response($this->getCurrentDirectoryFiles($this->directory));
            }
        }
        catch(\Exception $exception) {
            return $this->response(false);
        }
    }

    public function renameFile($params)
    {
        try {
            if($this->error) return $this->response(false);
            if($this->isTrackerFile($this->directory . '/' . $params['oldName'])) return $this->response(false);
            rename($params['oldName'], $params['name']);
            return $this->response($this->getCurrentDirectoryFiles($this->directory));
        }
        catch(\Exception $exception) {
            return $this->response(false);
        }
    }

    public function copyFile($params)
    {
        try {
            if($this->error) return $this->response(false);
            $newPath = $this->directory !== '/' ? $this->directory . '/' . $params['name'] : $this->directory . $params['name'];
            if ($params['type'] === 'Folder') {
                $this->copyRecursive($params['fullPath'], $newPath);
            } else {
                copy($params['fullPath'], $newPath);
            }
            return $this->response($this->getCurrentDirectoryFiles($this->directory));
        }
        catch(\Exception $exception) {
            return $this->response(false);
        }
    }

    public function moveFile($params)
    {
        try {
            if($this->error) return $this->response(false);
            $newPath = $this->directory !== '/' ? $this->directory . '/' . $params['name'] : $this->directory . $params['name'];
            if($this->isTrackerFile($newPath)) return json_encode(false);
            rename($params['fullPath'], $newPath);
            return $this->response($this->getCurrentDirectoryFiles($this->directory));
        }
        catch(\Exception $exception) {
            return $this->response(false);
        }
    }

    public function deleteFile($params)
    {
        try {
            if($this->error) return $this->response(false);
            if($this->isTrackerFile($this->directory . '/' . $params['name'])) return $this->response(false);
            unlink($params['name']);
            return $this->response($this->getCurrentDirectoryFiles($this->directory));
        }
        catch(\Exception $exception) {
            return $this->response(false);
        }
    }

    public function deleteDirectory($params)
    {
        try {
            if($this->error) return $this->response(false);
            $newPath = $this->directory !== '/' ? $this->directory . '/' . $params['name'] : $this->directory . $params['name'];
            if($this->isTrackerFile($newPath)) return $this->response(false);
            $this->deleteDirectoryRecursive($newPath);
            return $this->response($this->getCurrentDirectoryFiles($this->directory));
        }
        catch(\Exception $exception) {
            return $this->response(false);
        }
    }

}

$includes = [
    "core/lib/phpseclib/*.php",
    "core/lib/phpseclib/Crypt/*.php",
    "core/lib/phpseclib/File/*.php",
    "core/lib/phpseclib/Math/*.php",
    "core/lib/phpseclib/Net/*.php",
    "core/lib/phpseclib/System/*.php"
];

foreach($includes as $path) {
    foreach (glob($path) as $filename)
    {
        include_once $filename;
    }
}

class SFTPEditorController extends BaseController {
    private $directory;
    private $sftp;
    private $error;
    private $showHidden;
    private $rootDirectory;

    public function __construct($params)
    {
        $this->rootDirectory = dirname(__DIR__, 2) . '/landers';
        set_error_handler("APIEntities\\error_handler", E_ALL);
        $this->error = false;
        $host = isset($params['host']) ? $params['host'] : 'localhost';
        $port = isset($params['port']) ? $params['port'] : 22;
        $this->directory = isset($params['directory']) && strlen($params['directory']) ? $params['directory'] : $this->rootDirectory;
        $this->showHidden = isset($params['showHidden']) ? !!$params['showHidden'] : false;
        try {
            $this->sftp = new \Net_SFTP($host, $port, 2);
            $login = $this->sftp->login($params['login'], $params['password']);
            if(!$login) {
                throw new \Exception('Invalid login');
            }
            $dir = $this->sftp->chdir($this->directory);
            if(!$dir) {
                $this->directory = $this->rootDirectory;
                $dir = $this->sftp->chdir($this->directory);
                if(!$dir) {
                    $this->directory = '/';
                    $this->sftp->chdir($this->directory);
                }
            }
        }
        catch( \Exception $exception) {
            $this->error = true;
        }
    }

    private function getCurrentException() {
        $last = $this->sftp->getLastSFTPError();
        if($last) {
            list($statusCode,) = explode(':', $last, 2);

            switch ($statusCode) {
                case 'NET_SFTP_STATUS_FAILURE':
                case 'NET_SFTP_STATUS_EOF':
                    return false;
                case 'NET_SFTP_STATUS_NO_SUCH_FILE':
                case 'NET_SFTP_STATUS_PERMISSION_DENIED':
                default:
                    throw new \ErrorException();
            }
        }
        return false;
    }

    private function getFormattedPermissions($perms) {
        switch ($perms & 0xF000) {
            case 0xC000: // сокет
                $info = 's';
                break;
            case 0xA000: // символическая ссылка
                $info = 'l';
                break;
            case 0x8000: // обычный
                $info = '-';
                break;
            case 0x6000: // файл блочного устройства
                $info = 'b';
                break;
            case 0x4000: // каталог
                $info = 'd';
                break;
            case 0x2000: // файл символьного устройства
                $info = 'c';
                break;
            case 0x1000: // FIFO канал
                $info = 'p';
                break;
            default: // неизвестный
                $info = 'u';
        }

        // Владелец
                $info .= (($perms & 0x0100) ? 'r' : '-');
                $info .= (($perms & 0x0080) ? 'w' : '-');
                $info .= (($perms & 0x0040) ?
                    (($perms & 0x0800) ? 's' : 'x' ) :
                    (($perms & 0x0800) ? 'S' : '-'));

        // Группа
                $info .= (($perms & 0x0020) ? 'r' : '-');
                $info .= (($perms & 0x0010) ? 'w' : '-');
                $info .= (($perms & 0x0008) ?
                    (($perms & 0x0400) ? 's' : 'x' ) :
                    (($perms & 0x0400) ? 'S' : '-'));

        // Мир
                $info .= (($perms & 0x0004) ? 'r' : '-');
                $info .= (($perms & 0x0002) ? 'w' : '-');
                $info .= (($perms & 0x0001) ?
                    (($perms & 0x0200) ? 't' : 'x' ) :
                    (($perms & 0x0200) ? 'T' : '-'));

        return $info;
    }

    private function getFormattedFileType(string $file, string $type)
    {
        //if file or symlink
        if($type !== '2')
        {
            $info = pathinfo($file);
            if($info && isset($info['extension'])  && $file[0] !== '.')
            {
                return 'File ' . mb_strtoupper($info['extension']);
            }
            else return 'File';
        }
        else return 'Folder';
    }

    private function getCurrentDirectoryFiles(string $directory)
    {
        try {
            $contents = $this->sftp->rawlist($directory);
            return $this->parseList($contents, $this->sftp->pwd());
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    private function isEditable(string $path, string $type, string $perms)
    {
        if($type !== 'Folder') {
            return $this->sftp->is_writable($path) && $this->sftp->is_readable($path);
        }
        return $perms[2] === 'w';
    }
    private function parseList(array $list, string $fullPath) {
        if (is_array($list)) {
            $items = $list;
            $parsedItems = array();
            foreach($items as $name=>$value) {
                $item = null;
                $item['name'] = $name;
                $item['size'] = $value['type'] !== 2 ? round($value['size'] / 1024, 2) : '';
                $item['permissions'] = $this->getFormattedPermissions($value['permissions']);
                $item['lastChanged'] = $value['atime'];
                $item['fullPath'] = $fullPath === '/' ?  $fullPath . $name : $fullPath . '/' . $name;
                $item['type'] = $this->getFormattedFileType($name, $value['type']);
                $item['path'] = $fullPath;
                $item['isEditable'] = $this->isEditable($item['fullPath'], $item['type'], $item['permissions']);
                //$this->sftp->is_writable($item['fullPath']) && $this->sftp->is_readable($item['fullPath']);
                $item['hidden'] = $this->showHidden;
                $parsedItems[] = $item;
            }
            if($this->showHidden === false) {
                $parsedItems = array_filter($parsedItems, function ($item) {
                   if($item['name'][0] !== '.') return true;
                   return false;
                });
            }
            usort($parsedItems, function($a, $b) {
                if ($a['type'] == $b['type']) {
                    return strcmp($a['name'], $b['name']);
                }
                return strcmp($b['type'], $a['type']);
            });
            return $parsedItems;
        }
        throw new \Exception('Unable to get file list');
    }

    private function ftpCopyRecursive($src_dir, $dst_dir)
    {
//        $d = dir($src_dir);
        $files = $this->sftp->nlist($src_dir);
//        while($file = $d->read()) {
        foreach($files as $file) {
            if ($file !== "." && $file !== "..") {
                if (is_dir($src_dir."/".$file)) {
                    if (!$this->sftp->chdir($dst_dir."/".$file)) {
                        $this->sftp->mkdir( $dst_dir."/".$file);
                    }
                    $this->ftpCopyRecursive($src_dir."/".$file, $dst_dir."/".$file);
                } else {
                    $upload = $this->sftp->put( $dst_dir."/".$file, $this->sftp->get($src_dir."/".$file), FTP_BINARY);
                }
            }
        }
//        $d->close();
    }


    public function checkCredentials($params)
    {
        try {
            return json_encode(!$this->error);
        }
        catch(\Exception $exception)
        {
            return json_encode(false);
        }
        
    }
    public function getFilesList($params)
    {
        return json_encode($this->getCurrentDirectoryFiles($this->directory));
    }

    public function toParentDirectory($paramst)
    {
        $this->sftp->chdir('..');
        $this->directory = $this->sftp->pwd();
        return json_encode($this->getCurrentDirectoryFiles($this->directory));
    }

    public function getFileContent($params)
    {
        try {
            return json_encode($this->sftp->get($params['file']));
        }
        catch(\Exception $exception)
        {
            return json_encode(false);
        }

    }
    public function createFile($params)
    {
        try {
            $this->sftp->put($params['name'], $params['content']);
            $this->getCurrentException();
            return json_encode($this->getCurrentDirectoryFiles($this->directory));
        }
        catch(\Exception $exception)
        {
            return json_encode(false);
        }
    }

    public function createDirectory($params)
    {
        try {
            $this->sftp->mkdir($params['name']);
            $this->getCurrentException();
            return json_encode($this->getCurrentDirectoryFiles($this->directory));
        }
        catch(\Exception $exception)
        {
            return json_encode(false);
        }
    }

    public function isFileExists($params)
    {
        $files = $this->sftp->nlist($this->directory);
        foreach($files as $key=>$file) {
            $files[$key] = $this->directory . '/' . $file;
        }
        return json_encode(in_array($params['fullPath'], $files));
    }

    public function editFile($params)
    {
        try {
            $this->sftp->put($params['name'], $params['content']);
            $this->getCurrentException();
            return json_encode($this->getCurrentDirectoryFiles($this->directory));
        }
        catch(\Exception $exception)
        {
            return json_encode(false);
        }
    }

    public function renameFile($params)
    {
        try {
            $this->sftp->rename($params['oldName'], $params['name']);
            $this->getCurrentException();
            return json_encode($this->getCurrentDirectoryFiles($this->directory));
        }
        catch(\Exception $exception)
        {
            return json_encode(false);
        }
    }

    public function copyFile($params)
    {
        $newPath = $this->directory !== '/' ? $this->directory . '/' . $params['name'] : $this->directory . $params['name'];
        try {
            if($params['type'] === 'Folder') {
                $this->sftp->mkdir($params['name']);
                $this->sftp->chdir($newPath);
                $this->ftpCopyRecursive($params['fullPath'], $newPath);
                $this->sftp->chdir($this->directory);
            }
            else {
                $this->sftp->put( $newPath, $this->sftp->get($params['fullPath']), FTP_BINARY);
            }
            $this->getCurrentException();
            return json_encode($this->getCurrentDirectoryFiles($this->directory));
        }
        catch(\Exception $exception)
        {
            return json_encode(false);
        }
    }

    public function moveFile($params)
    {
        $newPath = $this->directory !== '/' ? $this->directory . '/' . $params['name'] : $this->directory . $params['name'];
        try {
            $this->sftp->rename( $params['fullPath'], $newPath);
            $this->getCurrentException();
            return json_encode($this->getCurrentDirectoryFiles($this->directory));
        }
        catch(\Exception $exception)
        {
            return json_encode(false);
        }
    }

    public function deleteFile($params)
    {
        try {
            $this->sftp->delete((string)$params['name']);
            $this->getCurrentException();
            return json_encode($this->getCurrentDirectoryFiles($this->directory));
        }
        catch(\Exception $exception)
        {
            return json_encode(false);
        }
    }

    public function deleteDirectory($params)
    {
        try {
            $this->sftp->delete((string)($params['name']), true);
            return json_encode($this->getCurrentDirectoryFiles($this->directory));
        }
        catch(\Exception $exception)
        {
            return json_encode(false);
        }
    }
}