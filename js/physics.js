// Matter.js のエンジン・ワールド・容器(壁)のセットアップ。
/* global Matter */

const { Engine, World, Bodies } = Matter;

export const CANVAS_WIDTH = 720;
export const CANVAS_HEIGHT = 960;
export const WALL_THICKNESS = 20;
export const DANGER_LINE_Y = 140;

export function createPhysics() {
  const engine = Engine.create();
  engine.gravity.y = 1.0;

  const wallOptions = { isStatic: true, render: { visible: false }, friction: 0.1 };

  const floor = Bodies.rectangle(
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT + WALL_THICKNESS / 2,
    CANVAS_WIDTH,
    WALL_THICKNESS,
    wallOptions
  );
  const leftWall = Bodies.rectangle(
    -WALL_THICKNESS / 2,
    CANVAS_HEIGHT / 2,
    WALL_THICKNESS,
    CANVAS_HEIGHT,
    wallOptions
  );
  const rightWall = Bodies.rectangle(
    CANVAS_WIDTH + WALL_THICKNESS / 2,
    CANVAS_HEIGHT / 2,
    WALL_THICKNESS,
    CANVAS_HEIGHT,
    wallOptions
  );

  World.add(engine.world, [floor, leftWall, rightWall]);

  return { engine, world: engine.world, walls: [floor, leftWall, rightWall] };
}
