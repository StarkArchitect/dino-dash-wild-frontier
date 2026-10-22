export interface BoundingBox3D {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export class CollisionMath {
  /**
   * Checks if two 3D Axis-Aligned Bounding Boxes intersect with an optional inset margin
   * to provide tight, fair gameplay collision detection.
   */
  public static checkAABB(
    a: BoundingBox3D,
    b: BoundingBox3D,
    insetPercent: number = 0.08
  ): boolean {
    const aWidth = a.maxX - a.minX;
    const aHeight = a.maxY - a.minY;
    const aDepth = a.maxZ - a.minZ;

    const bWidth = b.maxX - b.minX;
    const bHeight = b.maxY - b.minY;
    const bDepth = b.maxZ - b.minZ;

    // Apply tight collision inset so grazing visual edge doesn't kill player
    const aMinX = a.minX + aWidth * insetPercent;
    const aMaxX = a.maxX - aWidth * insetPercent;
    const aMinY = a.minY + aHeight * insetPercent * 0.5;
    const aMaxY = a.maxY - aHeight * insetPercent * 0.5;
    const aMinZ = a.minZ + aDepth * insetPercent;
    const aMaxZ = a.maxZ - aDepth * insetPercent;

    const bMinX = b.minX + bWidth * insetPercent;
    const bMaxX = b.maxX - bWidth * insetPercent;
    const bMinY = b.minY + bHeight * insetPercent * 0.5;
    const bMaxY = b.maxY - bHeight * insetPercent * 0.5;
    const bMinZ = b.minZ + bDepth * insetPercent;
    const bMaxZ = b.maxZ - bDepth * insetPercent;

    return (
      aMinX <= bMaxX &&
      aMaxX >= bMinX &&
      aMinY <= bMaxY &&
      aMaxY >= bMinY &&
      aMinZ <= bMaxZ &&
      aMaxZ >= bMinZ
    );
  }

  /**
   * Computes player bounding box given player position and state.
   */
  public static getPlayerBox(
    posX: number,
    posY: number,
    posZ: number,
    isCrouching: boolean
  ): BoundingBox3D {
    if (isCrouching) {
      // Streamlined lower profile: dino leans forward, ducking height halved
      return {
        minX: posX - 1.2,
        maxX: posX + 1.2,
        minY: posY,
        maxY: posY + 1.05,
        minZ: posZ - 0.5,
        maxZ: posZ + 0.5
      };
    } else {
      // Standard running upright posture
      return {
        minX: posX - 0.9,
        maxX: posX + 0.9,
        minY: posY,
        maxY: posY + 2.2,
        minZ: posZ - 0.5,
        maxZ: posZ + 0.5
      };
    }
  }

  /**
   * Computes an obstacle bounding box given its center, width, height, depth.
   */
  public static getObstacleBox(
    posX: number,
    posY: number,
    posZ: number,
    width: number,
    height: number,
    depth: number
  ): BoundingBox3D {
    return {
      minX: posX - width * 0.5,
      maxX: posX + width * 0.5,
      minY: posY,
      maxY: posY + height,
      minZ: posZ - depth * 0.5,
      maxZ: posZ + depth * 0.5
    };
  }
}
