/**
 * Created by Sentry on 3/27/17.
 */

(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a)return a(o, !0);
                if (i)return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f
            }
            var l = n[o] = {exports: {}};
            t[o][0].call(l.exports, function (e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }

    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++)s(r[o]);
    return s
})({
    1: [function (require, module, exports) {
        var Get = require('./get');
        var get = new Get();

        var exports = function () {
            var Camera = function () {
                this.width = 0;
                this.height = 0;
                this.rad1 = 0;
                this.rad2 = 0;
                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.r = 0;
                this.obj;
            };

            Camera.prototype.init = function (rad1, rad2, width, height) {
                this.width = width;
                this.height = height;
                this.r = 1000;
                this.rad1 = rad1;
                this.rad2 = rad2;
                this.obj = new THREE.PerspectiveCamera(35, this.width / this.height, 1, 10000);
                this.setPosition(this.rad1, this.rad2, this.r);
            };

            Camera.prototype.setPosition = function (rad1, rad2) {
                var points = get.pointSphere(rad1, rad2, this.r);
                this.obj.position.set(points[0], points[1], points[2]);
                this.obj.up.set(0, 1, 0);
                this.obj.lookAt({
                    x: 0,
                    y: 0,
                    z: 0
                });
            };

            return Camera;
        };

        module.exports = exports();

    }, {"./get": 3}],
    2: [function (require, module, exports) {
        module.exports = function (object, eventType, callback) {
            var timer;

            object.addEventListener(eventType, function (event) {
                clearTimeout(timer);
                timer = setTimeout(function () {
                    callback(event);
                }, 500);
            }, false);
        };

    }, {}],
    3: [function (require, module, exports) {
        var exports = function () {
            var Get = function () {
            };

            Get.prototype.randomInt = function (min, max) {
                return Math.floor(Math.random() * (max - min)) + min;
            };

            Get.prototype.degree = function (radian) {
                return radian / Math.PI * 180;
            };

            Get.prototype.radian = function (degrees) {
                return degrees * Math.PI / 180;
            };

            Get.prototype.pointSphere = function (rad1, rad2, r) {
                var x = Math.cos(rad1) * Math.cos(rad2) * r;
                var z = Math.cos(rad1) * Math.sin(rad2) * r;
                var y = Math.sin(rad1) * r;
                return [x, y, z];
            };

            return Get;
        };

        module.exports = exports();

    }, {}],
    4: [function (require, module, exports) {
        var Get = require('./get');
        var get = new Get();

        var exports = function () {
            var HemiLight = function () {
                this.rad1 = 0;
                this.rad2 = 0;
                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.r = 0;
                this.obj;
            };

            HemiLight.prototype.init = function (scene, rad1, rad2, r, hex1, hex2, intensity) {
                this.r = r;
                this.obj = new THREE.HemisphereLight(hex1, hex2, intensity);
                this.setPosition(rad1, rad2);
                scene.add(this.obj);
            };

            HemiLight.prototype.setPosition = function (rad1, rad2) {
                var points = get.pointSphere(rad1, rad2, this.r);
                this.obj.position.set(points[0], points[1], points[2]);
            };

            return HemiLight;
        };

        module.exports = exports();

    }, {"./get": 3}],
    5: [function (require, module, exports) {
        var Get = require('./get');
        var get = new Get();
        var debounce = require('./debounce');
        var Camera = require('./camera');
        var PointLight = require('./pointLight');
        var HemiLight = require('./hemiLight');
        var Mesh = require('./mesh');

        var bodyWidth = 700;
        var bodyHeight = 300;
        var fps = 60;
        var lasttimeBallMove = +new Date();
        var raycaster = new THREE.Raycaster();
        var mouseVector = new THREE.Vector2(-2, -2);
        var intersects;

        var canvas;
        var renderer;
        var scene;
        var camera;
        var light;
        var globe;
        var ball;

        var isGlipedBall = false;

        var initThree = function () {
            canvas = document.getElementById('orange');
            renderer = new THREE.WebGLRenderer({
                alpha: true
            });
            if (!renderer) {
                alert('ERROR');
            }
            renderer.setSize(bodyWidth, bodyHeight);
            canvas.appendChild(renderer.domElement);
            renderer.setClearColor(0xffffff, 0);

            scene = new THREE.Scene();
        };

        var init = function () {
            var ballGeometry = new THREE.DodecahedronGeometry(100, 1);
            var ballMaterial = new THREE.MeshPhongMaterial({
                color: 0xffbd4a,
                shading: THREE.FlatShading
            });

            initThree();

            camera = new Camera();
            camera.init(get.radian(20), get.radian(0), bodyWidth, bodyHeight);

            light = new HemiLight();
            light.init(scene, get.radian(30), get.radian(60), 1000, 0xffbd4a, 0x000000, 1);

            ball = new Mesh();
            ball.init(scene, ballGeometry, ballMaterial);

            renderloop();
            setEvent();
            debounce(window, 'resize', function (event) {
                resizeRenderer();
            });
        };

        var setEvent = function () {
            var mousedownX = 0;
            var mousedownY = 0;
            var mousemoveX = 0;
            var mousemoveY = 0;

            var eventTouchStart = function (x, y) {
                mousedownX = 0;
                mousedownY = 0;
                mouseVector.x = (x / window.innerWidth) * 2 - 1;
                mouseVector.y = -(y / window.innerHeight) * 2 + 1;
                raycaster.setFromCamera(mouseVector, camera.obj);
                intersects = raycaster.intersectObjects(scene.children);
                for (var i = 0; i < intersects.length; i++) {
                    if (intersects[i].object.id == ball.id) {
                        isGlipedBall = true;
                    }
                }
                ;
            };

            var eventTouchMove = function (x, y) {
                mousemoveX = x;
                mousemoveY = y;
                mouseVector.x = (x / window.innerWidth) * 2 - 1;
                mouseVector.y = -(y / window.innerHeight) * 2 + 1;
            };

            var eventTouchEnd = function (x, y) {
                if (isGlipedBall) {
                    ball.released();
                    isGlipedBall = false;
                }
            };

            canvas.addEventListener('contextmenu', function (event) {
                event.preventDefault();
            });

            canvas.addEventListener('selectstart', function (event) {
                event.preventDefault();
            });

            canvas.addEventListener('mousedown', function (event) {
                event.preventDefault();
                eventTouchStart(event.clientX, event.clientY);
            });

            canvas.addEventListener('mousemove', function (event) {
                event.preventDefault();
                eventTouchMove(event.clientX, event.clientY);
            });

            canvas.addEventListener('mouseup', function (event) {
                event.preventDefault();
                eventTouchEnd();
            });

            canvas.addEventListener('touchstart', function (event) {
                event.preventDefault();
                eventTouchStart(event.touches[0].clientX, event.touches[0].clientY);
            });

            canvas.addEventListener('touchmove', function (event) {
                event.preventDefault();
                eventTouchMove(event.touches[0].clientX, event.touches[0].clientY);
            });

            canvas.addEventListener('touchend', function (event) {
                event.preventDefault();
                eventTouchEnd();
            });
        };

        var render = function () {
            renderer.clear();

            ball.moveObject();
            ball.updateVertices();
            if (isGlipedBall) {
                ball.gliped();
            }

            renderer.render(scene, camera.obj);
        };

        var renderloop = function () {
            var now = +new Date();
            render();
            if (now - lasttimeBallMove > 1000) {
                var rad1 = get.radian(get.randomInt(0, 10));
                var rad2 = get.radian(get.randomInt(0, 480));
                var r = get.randomInt(120, 360);
                ball.updateMoveValBase(rad1, rad2, r);
                lasttimeBallMove = +new Date();
            }
            setTimeout(renderloop, 1000 / fps);
        };

        var resizeRenderer = function () {
            bodyWidth = 700;
            bodyHeight = document.body.clientHeight;
            renderer.setSize(bodyWidth, bodyHeight);
            camera.init(get.radian(20), get.radian(0), bodyWidth, bodyHeight);
        };

        init();

    }, {"./camera": 1, "./debounce": 2, "./get": 3, "./hemiLight": 4, "./mesh": 6, "./pointLight": 8}],
    6: [function (require, module, exports) {
        var Get = require('./get');
        var get = new Get();
        var Particle = require('./particle');
        var particle = new Particle();

        var exports = function () {
            var Mesh = function () {
                this.r = 0;
                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.m = 1;
                this.rad = 0;
                this.move = {
                    cd: 0.5,
                    k: 0.3,
                    val: [0, 0, 0],
                    valBase: [0, 0, 0],
                    a: [0, 0, 0],
                    v: [0, 0, 0]
                };
                this.expand = {
                    cd: 0.2,
                    k: 0.4,
                    val: 0,
                    valBase: 0,
                    a: 0,
                    v: 0
                };
                this.geometry;
                this.material;
                this.mesh;
                this.vertexArr = [];
                this.vertexDeg = [];
                this.vertexWaveCoe = 0;
                this.particles = [];
                this.particleNum = 24;
            };

            Mesh.prototype.init = function (scene, geometry, material) {
                var particleGeometry = new THREE.SphereGeometry(1, 2, 2);
                var particleMaterial = new THREE.MeshPhongMaterial({
                    color: 0xeeeeee,
                    shading: THREE.FlatShading
                });

                this.geometry = geometry;
                this.material = material;
                this.mesh = new THREE.Mesh(this.geometry, this.material);
                this.r = this.geometry.parameters.radius;
                this.vertexWaveCoe = this.r / 50;

                this.geometry.mergeVertices();
                this.updateVerticesInt();
                this.setPosition();

                scene.add(this.mesh);
                this.id = this.mesh.id;

                for (var i = 0; i < this.particleNum; i++) {
                    this.particles[i] = new Particle();
                    this.particles[i].init(scene, particleGeometry, particleMaterial, i, this.particleNum - 1);
                }
            };

            Mesh.prototype.setPosition = function () {
                this.mesh.position.set(this.x, this.y, this.z);
            };

            Mesh.prototype.setRotation = function () {
                this.rotateX = this.rad * 3;
                this.rotateY = this.rad * 3;
                this.rotateZ = this.rad * 3;
                this.mesh.rotation.set(this.rotateX, this.rotateY, this.rotateZ);
            };

            Mesh.prototype.comuputeGeometry = function () {
                this.mesh.geometry.computeVertexNormals();
                this.mesh.geometry.computeFaceNormals();
                this.mesh.geometry.verticesNeedUpdate = true;
                this.mesh.geometry.elementsNeedUpdate = true;
                this.mesh.geometry.normalsNeedUpdate = true;
            };

            Mesh.prototype.updateVerticesInt = function () {
                var vertices = this.mesh.geometry.vertices;
                for (var i = 0; i < vertices.length; i++) {
                    var r = this.r;
                    this.vertexArr[i] = r;
                    this.vertexDeg[i] = get.randomInt(0, 360);
                    r = this.vertexArr[i] + Math.sin(get.radian(this.vertexDeg[i])) * this.vertexWaveCoe;
                    vertices[i].normalize().multiplyScalar(r);
                }
                this.comuputeGeometry();
            };

            Mesh.prototype.updateVertices = function () {
                var vertices = this.mesh.geometry.vertices;
                this.expand.a = (this.expand.valBase - this.expand.val) * this.expand.k;
                this.expand.a -= this.expand.cd * this.expand.v;
                this.expand.v += this.expand.a;
                this.expand.val += this.expand.v;
                for (var i = 0; i < this.vertexArr.length; i++) {
                    var r;
                    this.vertexDeg[i] += 8;

                    r = this.vertexArr[i] + this.expand.val + Math.sin(get.radian(this.vertexDeg[i])) * this.vertexWaveCoe;
                    vertices[i].normalize().multiplyScalar(r);
                }
                this.comuputeGeometry();
            };

            Mesh.prototype.gliped = function () {
                this.expand.k = 0.03;
                this.expand.cd = 0.4;
                this.expand.valBase = 60;
            };

            Mesh.prototype.released = function () {
                this.expand.k = 0.2;
                this.expand.cd = 0.3;
                this.expand.valBase = 0;
            };

            Mesh.prototype.updateMoveValBase = function (rad1, rad2, r) {
                this.move.valBase = get.pointSphere(rad1, rad2, r);
            };

            Mesh.prototype.moveObject = function () {
                for (var i = 0; i < 3; i++) {
                    this.move.a[i] = (this.move.valBase[i] - this.move.val[i]) * this.move.k / this.m;
                    this.move.a[i] -= this.move.cd * this.move.v[i];
                    this.move.v[i] += this.move.a[i];
                    this.move.val[i] += this.move.v[i];
                }
                this.x = this.move.val[0];
                this.y = this.move.val[1];
                this.z = this.move.val[2];
                this.rad += get.radian(0.1);
                this.setPosition();
                this.setRotation();
                for (var i = 0; i < this.particles.length; i++) {
                    this.particles[i].r = this.particles[i].rBase + this.expand.val;
                    this.particles[i].moveObject(this.move.valBase);
                }
                ;
            };

            return Mesh;
        };

        module.exports = exports();

    }, {"./get": 3, "./particle": 7}],
    7: [function (require, module, exports) {
        var Get = require('./get');
        var get = new Get();

        var exports = function () {
            var Particle = function () {
                this.size = 1;
                this.scale = get.randomInt(16, 32);
                this.rad1Base = 0;
                this.rad1 = 0;
                this.rad2Base = 0;
                this.rad2 = 0;
                this.rBase = get.randomInt(150, 180);
                this.r = this.rBase;
                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.m = 1;
                this.move = {
                    cd: 0.5,
                    k: 0.1,
                    val: [0, 0, 0],
                    valBase: [0, 0, 0],
                    a: [0, 0, 0],
                    v: [0, 0, 0]
                };
                this.rotateX = 0;
                this.rotateY = 0;
                this.rotateZ = 0;
                this.geometry;
                this.material;
                this.mesh;
            };

            Particle.prototype.init = function (scene, geometry, material, index, all) {
                this.geometry = geometry;
                this.material = material;
                this.mesh = new THREE.Mesh(this.geometry, this.material);
                this.m = index / 5 + 1;

                this.changeScale();
                this.rad1Base = get.radian(get.randomInt(0, 360));
                this.rad2Base = get.radian(get.randomInt(0, 360));
                this.setPosition();
                this.setRotation();
                scene.add(this.mesh);
            };

            Particle.prototype.setPosition = function () {
                var points = get.pointSphere(this.rad1, this.rad2, this.r);
                this.mesh.position.set(points[0] + this.move.val[0], points[1] + this.move.val[1], points[2] + this.move.val[2]);
            };

            Particle.prototype.setRotation = function () {
                this.rotateX = this.rad1 * 3;
                this.rotateY = this.rad1 * 3;
                this.rotateZ = this.rad1 * 3;
                this.mesh.rotation.set(this.rotateX, this.rotateY, this.rotateZ);
            };

            Particle.prototype.changeScale = function () {
                this.mesh.scale.x = this.scale * this.size;
                this.mesh.scale.y = this.scale * this.size;
                this.mesh.scale.z = this.scale * this.size;
            };

            Particle.prototype.moveObject = function (valBase) {
                this.move.valBase = valBase;
                this.rad1Base += get.radian(1);
                this.rad2Base += get.radian(1);
                for (var i = 0; i < 3; i++) {
                    this.move.a[i] = (this.move.valBase[i] - this.move.val[i]) * this.move.k / this.m;
                    this.move.a[i] -= this.move.cd * this.move.v[i];
                    this.move.v[i] += this.move.a[i];
                    this.move.val[i] += this.move.v[i];
                }
                this.rad1 = this.rad1Base;
                this.rad2 = this.rad2Base;
                this.setPosition();
                this.setRotation();
            };

            return Particle;
        };

        module.exports = exports();

    }, {"./get": 3}],
    8: [function (require, module, exports) {
        var Get = require('./get');
        var get = new Get();

        var exports = function () {
            var PointLight = function () {
                this.rad1 = 0;
                this.rad2 = 0;
                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.r = 0;
                this.obj;
            };

            PointLight.prototype.init = function (scene, rad1, rad2, r, hex, intensity, distance) {
                this.r = r;
                this.obj = new THREE.PointLight(hex, intensity, distance);
                this.setPosition(rad1, rad2);
                scene.add(this.obj);
            };

            PointLight.prototype.setPosition = function (rad1, rad2) {
                var points = get.pointSphere(rad1, rad2, this.r);
                this.obj.position.set(points[0], points[1], points[2]);
            };

            return PointLight;
        };

        module.exports = exports();

    }, {"./get": 3}]
}, {}, [5]);