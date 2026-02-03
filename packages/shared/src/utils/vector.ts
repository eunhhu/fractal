export function pointColBound(point: Point, bound: Bound):boolean{
    return point.x >= bound.x && point.x <= bound.x + bound.width && point.y >= bound.y && point.y <= bound.y + bound.height;
}

export function pointColCircle(point: Point, circle: Circle):boolean{
    return Math.sqrt((point.x - circle.x) ** 2 + (point.y - circle.y) ** 2) <= circle.radius;
}

export function boundColBound(bound1: Bound, bound2: Bound):boolean{
    return bound1.x < bound2.x + bound2.width && bound1.x + bound1.width > bound2.x && bound1.y < bound2.y + bound2.height && bound1.y + bound1.height > bound2.y;
}

export function circleColCircle(circle1: Circle, circle2: Circle):boolean{
    return Math.sqrt((circle1.x - circle2.x) ** 2 + (circle1.y - circle2.y) ** 2) <= circle1.radius + circle2.radius;
}

export function circleColBound(circle: Circle, bound: Bound):boolean{
    let x = Math.max(bound.x, Math.min(circle.x, bound.x + bound.width));
    let y = Math.max(bound.y, Math.min(circle.y, bound.y + bound.height));
    return Math.sqrt((x - circle.x) ** 2 + (y - circle.y) ** 2) < circle.radius;
}

export const lineColLine = (
    line1: Line,
    line2: Line,
): boolean => {
    const orientation = (p: Point, q: Point, r: Point): number => {
        const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        if (val === 0) return 0; // collinear
        return (val > 0) ? 1 : 2; // clock or counterclock wise
    };

    const onSegment = (p: Point, q: Point, r: Point): boolean => {
        return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
               q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
    };

    const o1 = orientation(line1.start, line1.end, line2.start);
    const o2 = orientation(line1.start, line1.end, line2.end);
    const o3 = orientation(line2.start, line2.end, line1.start);
    const o4 = orientation(line2.start, line2.end, line1.end);

    // 일반적인 경우
    if (o1 !== o2 && o3 !== o4) return true;

    // 특별한 경우
    if (o1 === 0 && onSegment(line1.start, line2.start, line1.end)) return true; // line2.start가 선분 line1 위에 있음
    if (o2 === 0 && onSegment(line1.start, line2.end, line1.end)) return true; // line2.end가 선분 line1 위에 있음
    if (o3 === 0 && onSegment(line2.start, line1.start, line2.end)) return true; // line1.start가 선분 line2 위에 있음
    if (o4 === 0 && onSegment(line2.start, line1.end, line2.end)) return true; // line1.end가 선분 line2 위에 있음

    return false; // 선분이 겹치지 않음
};

export const distancePointLine = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const l2 = (lineEnd.x - lineStart.x) ** 2 + (lineEnd.y - lineStart.y) ** 2;
    if (l2 === 0) return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2); // 시작과 끝이 같은 점일 경우
    const t = ((point.x - lineStart.x) * (lineEnd.x - lineStart.x) + (point.y - lineStart.y) * (lineEnd.y - lineStart.y)) / l2;
    const tClamped = Math.max(0, Math.min(1, t));
    const closestPoint = {
        x: lineStart.x + tClamped * (lineEnd.x - lineStart.x),
        y: lineStart.y + tClamped * (lineEnd.y - lineStart.y),
    };
    return Math.sqrt((point.x - closestPoint.x) ** 2 + (point.y - closestPoint.y) ** 2);
};