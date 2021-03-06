 根据原作者说明文档搭建的过程中会出现一些安装环境问题，现已解决。具体步骤如下：

1、安装nodejs，执行npm install发现超级慢（如果没有翻墙，根本安装不成功），如果已安装半头而废请使用以下命令重新安装
	
	rm -rf node_modules/    # 删除已安装的模块
	npm cache clean         # 清除 npm 内部缓存

2、手动指定npm安装的依赖环境为国内阿里提供的镜像服务器。命令如下：  

	npm install -gd express --registry=http://registry.npm.taobao.org
	
	只需要使用–registry参数指定镜像服务器地址，为了避免每次安装都需要--registry参数，可以使用如下命令进行永久设置：
	npm config set registry http://registry.npm.taobao.org

3、修改`package.json`依赖清单，修改内容如下：  

	"jade": "^1.11.0", 改为 "pug": "2.0.0-rc.2",

4、修改一切与jade模块相关的文件，修改内容如下图：  
![需要修改jade](https://raw.github.com/xym-loveit/redis-sentinel-ui/master/screenshot/jade.png)  

5、修改 主目录/views目录下所有jade后缀的文件，改为pug后缀，修改结果见下图：  
![将后缀更改为pug](https://raw.github.com/xym-loveit/redis-sentinel-ui/master/screenshot/pug.png)   

6、前五步骤完成，cd 到`redis-sentinel-ui主目录`执行`npm install`。  

7、其他步骤请按照readme介绍即可。  

8、其中一下两步可以这样配置：  

	nohup  node god.js >>god.log 2>&1 &
	nohup  node app.js >>god.log 2>&1 &

9、针对有些特殊依赖需要使用独立安装（使用root管理员权限，为了简洁centos 直接采用npm install 安装即可，如gulp的安装）。
	
说明：监控本人初略的看了下，是开启子进程（监控进程）定时捞取自哨兵（sentinel）的redis info信息数据，然后暂存sqllite数据库中，从这里也看出来nodejs的强大。