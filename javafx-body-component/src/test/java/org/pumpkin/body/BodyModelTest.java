package org.pumpkin.body;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class BodyModelTest {
    @Test void decodesAllOriginalGeometryAndValidIndices() throws Exception {
        BodyModel model = BodyModel.load();
        assertEquals(18, model.parts().size());
        int vertices = 0, indices = 0;
        for (var part : model.parts()) {
            vertices += part.points().length / 3; indices += part.indices().length;
            assertEquals(0, part.indices().length % 3);
            for (float p : part.points()) assertTrue(Float.isFinite(p));
            for (int index : part.indices()) assertTrue(index >= 0 && index < part.points().length / 3);
        }
        assertEquals(1164996, vertices * 6 + indices * 2);
        var skin = model.parts().getFirst();
        assertEquals(-32.605583f, skin.points()[0], .00001f);
        assertEquals(8.264675f, skin.points()[1], .00001f);
        assertEquals(-7.893238f, skin.points()[2], .00001f);
        float minY = Float.POSITIVE_INFINITY, maxY = Float.NEGATIVE_INFINITY;
        for (int i = 1; i < skin.points().length; i += 3) { minY = Math.min(minY, skin.points()[i]); maxY = Math.max(maxY, skin.points()[i]); }
        assertEquals(-83.05f, minY, .01f); assertEquals(82.78f, maxY, .01f);
    }
    @Test void preservesNineSystemsAndNamedAndMeshAnchors() throws Exception {
        BodyModel model = BodyModel.load();
        assertEquals(9, model.systems().size()); assertEquals(9, model.anchors().size());
        assertEquals(new BodyModel.Point(.85, 42.2, 2.38), model.anchors().get("heart"));
        assertEquals(new BodyModel.Point(-9.54, .04, -.76), model.anchors().get("bone"));
        assertEquals(new BodyModel.Point(-8.68, -19.49, 2.2), model.anchors().get("muscle"));
        assertEquals(0, model.systems().stream().filter(s -> s.id().equals("muscle")).findFirst().orElseThrow().meshes().size());
    }
}
